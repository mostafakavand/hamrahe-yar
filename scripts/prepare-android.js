
const fs = require("fs");
const path = require("path");

const root = process.cwd();

const source = path.join(
  root,
  "native",
  "android",
  "app",
  "src",
  "main",
  "java"
);

const destination = path.join(
  root,
  "android",
  "app",
  "src",
  "main",
  "java"
);

if (!fs.existsSync(source)) {
  throw new Error("Native Android source directory not found.");
}

if (!fs.existsSync(destination)) {
  throw new Error("Generated Android Java directory not found.");
}

fs.cpSync(source, destination, {
  recursive: true,
  force: true
});

console.log("Native Android files copied successfully.");
