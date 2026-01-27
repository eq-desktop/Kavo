import parseFile from "./src/parseFile.js";
import fs from "fs";

parseFile(process.argv[2]).then(output => {
    const file = process.argv[2] + ".json";
    fs.writeFileSync(file, JSON.stringify(output, null, 2));
    console.log("Wrote output to", file);
});