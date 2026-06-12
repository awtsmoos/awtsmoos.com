// B"H
const path = require("path");
const { SECRET_FILES } = require("./constants.js");

function safePath(config, given) {
  const root = path.resolve(config.root);
  const input = given || ".";
  const full = path.isAbsolute(input) ? path.resolve(input) : path.resolve(root, input);

  if (!full.toLowerCase().startsWith(root.toLowerCase())) {
    throw new Error("Path outside allowed project root: " + full);
  }

  return full;
}

function rel(config, full) {
  return path.relative(config.root, full).replace(/\\/g, "/") || ".";
}

function assertNotSecret(config, full) {
  if (config.allowSecrets) return;
  const name = path.basename(full);
  if (SECRET_FILES.has(name)) {
    throw new Error("Refusing secret-like file by default: " + name);
  }
}

module.exports = {
  safePath,
  rel,
  assertNotSecret
};