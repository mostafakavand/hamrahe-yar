
const fs = require("fs");
const path = require("path");

const root = process.cwd();
const target = path.join(root, "www");

const files = [
  "index.html",
  "manifest.json",
  "sw.js",
  "icons"
];

fs.rmSync(target, { recursive: true, force: true });
fs.mkdirSync(target, { recursive: true });

for (const file of files) {
  const source = path.join(root, file);
  const destination = path.join(target, file);

  if (!fs.existsSync(source)) {
    throw new Error(`Required file not found: ${file}`);
  }

  fs.cpSync(source, destination, { recursive: true });
}

console.log("Web files copied successfully.");
