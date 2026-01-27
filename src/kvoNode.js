class KvoNode {
    constructor(obj) {
        this._obj = obj;
    }

    // Access underlying object
    get raw() {
        return this._obj;
    }

    // Get children as KvoNode instances
    get children() {
        return (this._obj.children || []).map(c => new KvoNode(c));
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
     * Returns the KvoNode or property value
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

export default KvoNode;