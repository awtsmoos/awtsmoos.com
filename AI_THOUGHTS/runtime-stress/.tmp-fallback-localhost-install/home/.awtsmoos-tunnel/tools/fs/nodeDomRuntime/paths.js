// B"H
const fs = require("fs");
const path = require("path");

/**
 * B"H
 * Walks upward until the Merkava executor is found. The codebase is not guessed;
 * the path is revealed from the current file like sparks returning to their root.
 */
function findMerkavaRoot(start = __dirname) {
  let dir = path.resolve(start);
  while (dir && dir !== path.dirname(dir)) {
    for (const rel of ["geelooy/scripts/awtsmoos/MerkavaExecutor", "scripts/awtsmoos/MerkavaExecutor"]) {
      const candidate = path.join(dir, rel);
      if (fs.existsSync(path.join(candidate, "merkava-browser/VirtualWindow.js"))) return candidate;
    }
    dir = path.dirname(dir);
  }
  throw new Error("MerkavaExecutor root not found from " + start);
}

function slash(value) {
  return String(value || "").replace(/\\/g, "/");
}

module.exports = { findMerkavaRoot, slash };
