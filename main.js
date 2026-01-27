const fs = require("fs");

function parseFile(file) {
    return fs.promises.readFile(file, "utf8").then(data => {
        const parsed = parse(data, null, { allowImports: true });
        return parsed;
    });
}

function newPart({
    name = "",
    kind = "object",
    type = "KantaraObject",
    children = [],
    args = [],
    value = null,
    properties = {}
} = {}) {
    return { name, kind, type, arguments: args, value, properties, children };
}

function stripComments(src) {
    return src
        .replace(/\/\/.*$/gm, "")
        .replace(/\/\*[\s\S]*?\*\//g, "");
}

function normalizeIndent(block) {
    const lines = block.split("\n");

    // Remove leading/trailing empty lines
    while (lines.length && lines[0].trim() === "") lines.shift();
    while (lines.length && lines[lines.length - 1].trim() === "") lines.pop();

    // Find smallest indentation (ignore empty lines)
    let minIndent = Infinity;

    for (const line of lines) {
        if (!line.trim()) continue;
        const match = line.match(/^(\s+)/);
        if (match) {
            minIndent = Math.min(minIndent, match[1].length);
        } else {
            minIndent = 0;
            break;
        }
    }

    if (!isFinite(minIndent)) minIndent = 0;

    // Remove that indent
    return lines
        .map(line => line.startsWith(" ".repeat(minIndent)) ? line.slice(minIndent) : line)
        .join("\n");
}

function scanBlock(lines, startIndex) {
    let state = { inString: false, escape: false, depth: 1 };
    let body = [];
    let i = startIndex;

    for (; i < lines.length; i++) {
        const line = lines[i];
        for (let c of line) {
            if (state.escape) { state.escape = false; continue; }
            if (c === "\\") { state.escape = true; continue; }
            if (c === '"') { state.inString = !state.inString; continue; }
            if (!state.inString) {
                if (c === "{") state.depth++;
                if (c === "}") state.depth--;
            }
        }

        if (state.depth === 0) break;
        body.push(line);
    }

    return { body: body.join("\n"), endIndex: i };
}

function parseValue(raw) {
    raw = raw.trim();
    if (/^".*"$/.test(raw)) return { type: "string", value: raw.slice(1, -1) };
    if (!isNaN(raw)) return { type: "number", value: Number(raw) };
    if (raw === "true" || raw === "false") return { type: "boolean", value: raw === "true" };
    return { type: "string", value: raw };
}

/* ------------------------------- PARSER ------------------------------- */

function parse(data, parent = null, options = { allowImports: false }) {
    allowImports = options.allowImports;
    data = stripComments(data);
    const lines = data.split("\n");
    const root = parent || newPart({ name: "root" });

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();
        if (!line) continue;

        if (line.startsWith("@import ")) {
            // detect inline mode if needed
            const inlineMode = line.startsWith("@import nonfinal ");
            const filePath = line.split(/import(?: nonfinal)?\s+/)[1].replace(/["']/g, "").trim();

            if (allowImports && !inlineMode) {
                // Read and parse the imported file immediately
                const importedData = fs.readFileSync(filePath, "utf-8");
                let importedNode = parse(importedData, null, options); // recursive parse with same options
                // Inject children of imported node into current object
                if (importedNode.children) {
                    root.children.push(...importedNode.children);
                }
            } else {
                // Just store as an import reference
                root.children.push(newPart({
                    name: filePath,
                    kind: "import",
                    type: "KantaraImport",
                    value: filePath
                }));
            }

            continue;
        }

        /* ---------- FUNCTION ---------- */
        if (/^[\w]+\(.*\)\s*\{?$/.test(line)) {
            const name = line.split("(")[0].trim();
            const args = line.match(/\((.*?)\)/)[1]
                .split(",")
                .map(a => a.trim())
                .filter(Boolean);

            const node = newPart({ name, kind: "function", type: "KantaraFunction", args });

            if (!line.includes("{")) i++;
            const { body, endIndex } = scanBlock(lines, i + 1);
            node.children.push(normalizeIndent(body));
            root.children.push(node);
            i = endIndex;
            continue;
        }

        /* ---------- SECTION ---------- */
        if (line.includes("{")) {
            const name = line.split(" ")[0];
            const propString = line
                .slice(name.length)
                .replace(/[{}]/g, "")   // remove BOTH braces
                .trim();
            const node = newPart({ name, kind: "section", type: "KantaraSection" });

            if (propString) {
                node.properties = parseInlineProps(propString);
            }

            const { body, endIndex } = scanBlock(lines, i + 1);
            parse(body, node, options);
            root.children.push(node);
            i = endIndex;
            continue;
        }

        /* ---------- PROPERTY ---------- */
        if (line.includes(":")) {
            const [k, v] = line.split(/:(.+)/);
            const { type, value } = parseValue(v);
            root.children.push(newPart({
                name: k.trim(),
                kind: "property",
                type,
                value
            }));
            continue;
        }

        throw new Error(`Unknown syntax: ${line}`);
    }

    return root;
}

/* -------------------- INLINE SECTION PROPERTY PARSER -------------------- */

function parseInlineProps(str) {
    const props = {};
    let i = 0;

    function skipSpaces() {
        while (i < str.length && /\s/.test(str[i])) i++;
    }
    function readKeyOrFlag() {
        skipSpaces();

        if (str[i] === '"') {
            i++; // skip opening quote
            let start = i;
            while (i < str.length && str[i] !== '"') i++;
            const val = str.slice(start, i);
            i++; // closing quote
            return val;
        }

        let start = i;
        while (i < str.length && !/[\s:]/.test(str[i])) i++;
        return str.slice(start, i);
    }

    function readWord() {
        let start = i;
        while (i < str.length && !/[\s:]/.test(str[i])) i++;
        return str.slice(start, i);
    }

    function readValue() {
        skipSpaces();
        if (str[i] === '"') {
            i++;
            let start = i;
            while (i < str.length && str[i] !== '"') i++;
            let val = str.slice(start, i);
            i++; // closing quote
            return val;
        }
        let start = i;
        while (i < str.length && !/\s/.test(str[i])) i++;
        return str.slice(start, i);
    }

    while (i < str.length) {
        skipSpaces();
        if (i >= str.length) break;

        let key = readKeyOrFlag();
        skipSpaces();

        if (str[i] === ":") {
            i++;
            let raw = readValue();

            if (!isNaN(raw)) props[key] = Number(raw);
            else if (raw === "true" || raw === "false") props[key] = raw === "true";
            else props[key] = raw;
        } else {
            props[key] = true;
        }
    }

    return props;
}

/* ----------------------------- Helper class ----------------------------- */
class KtaNode {
    constructor(obj) {
        this._obj = obj;
    }

    // Access underlying object
    get raw() {
        return this._obj;
    }

    // Get children as KtaNode instances
    get children() {
        return (this._obj.children || []).map(c => new KtaNode(c));
    }

    // Find first child by name
    find(name) {
        return this.children.find(c => c.name === name) || null;
    }

    // Find all children by name
    findAll(name) {
        return this.children.filter(c => c.name === name);
    }

    // Get property by key (returns undefined if missing)
    prop(key) {
        return this._obj.properties ? this._obj.properties[key] : undefined;
    }

    // Filter children by kind ("section", "function", "property")
    filterKind(kind) {
        return this.children.filter(c => c.kind === kind);
    }

    // Recursively search for a node by name
    search(name) {
        if (this._obj.name === name) return this;
        for (const child of this.children) {
            const found = child.search(name);
            if (found) return found;
        }
        return null;
    }

    // Pretty-print for debug
    print(indent = 0) {
        const pad = " ".repeat(indent * 2);
        console.log(`${pad}${this._obj.kind}: ${this._obj.name}`);
        if (this._obj.kind === "function") return;
        for (const child of this.children) child.print(indent + 1);
    }

    // Map children to a function
    mapChildren(fn) {
        return this.children.map(fn);
    }

    // Check if node has a child of certain name
    hasChild(name) {
        return this.children.some(c => c.name === name);
    }

    /**
     * Navigate the tree by a dot-separated path
     * e.g. "sections.toggles.subSection.key"
     * Returns the KtaNode or property value
     */
    navigate(path) {
        if (!path) return this;

        const parts = path.split(".");
        let current = this;

        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];

            // If it's the last part, try property first
            if (i === parts.length - 1) {
                if (current.prop(part) !== undefined) {
                    return current.prop(part); // return property value
                }
            }

            // Move into child section/function with that name
            const next = current.find(part);
            if (!next) return undefined; // not found
            current = next;
        }

        return current;
    }
}

parseFile(process.argv[2]).then(output => {
    const file = process.argv[2] + ".json";
    fs.writeFileSync(file, JSON.stringify(output, null, 2));
    console.log("Wrote output to", file);
});
