import fs from "fs";
import parse from "./utils.js";

export default function parseFile(file) {
    return fs.promises.readFile(file, "utf8").then(data => {
        const parsed = parse(data, null, { allowImports: true });
        return parsed;
    });
}