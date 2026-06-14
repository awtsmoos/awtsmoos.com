// B"H
const fs = require("fs");
const os = require("os");
const path = require("path");

const RELS = Object.freeze([
  "geelooy/scripts/awtsmoos/MerkavaExecutor",
  "scripts/awtsmoos/MerkavaExecutor"
]);

/**
 * B"H
 * Chapter 419: The Installed Agent Remembered The Project Root.
 *
 * node-dom runs from ~/.awtsmoos-tunnel, but Merkava lives inside the user's
 * project. The search therefore starts from explicit roots, the saved tunnel
 * config root, process roots, and only then the installed tool folder.
 */
function findMerkavaRoot(start = __dirname, hints = {}) {
  const roots = candidateStarts(start, hints);
  for (const root of roots) {
    const found = searchUp(root);
    if (found) return found;
  }
  throw new Error("MerkavaExecutor root not found from " + start + " tried " + roots.join(", "));
}

function candidateStarts(start, hints = {}) {
  return unique([
    hints.merkavaRoot,
    hints.projectRoot,
    hints.root,
    hints.virtualEnv && hints.virtualEnv.root,
    readTunnelConfigRoot(),
    process.env.AWTSMOOS_PROJECT_ROOT,
    process.env.AWTSMOOS_ROOT,
    process.cwd(),
    start,
    __dirname
  ].filter(Boolean).map(value => path.resolve(String(value))));
}

function searchUp(start) {
  let dir = path.resolve(start);
  while (dir && dir !== path.dirname(dir)) {
    const direct = hasMerkava(dir) ? dir : null;
    if (direct) return direct;
    for (const rel of RELS) {
      const candidate = path.join(dir, rel);
      if (hasMerkava(candidate)) return candidate;
    }
    dir = path.dirname(dir);
  }
  return null;
}

function hasMerkava(candidate) {
  return fs.existsSync(path.join(candidate, "merkava-browser/VirtualWindow.js"));
}

function readTunnelConfigRoot() {
  try {
    const file = path.join(os.homedir(), ".awtsmoos-tunnel", "config.json");
    const parsed = JSON.parse(fs.readFileSync(file, "utf8"));
    return parsed && parsed.root;
  } catch (_) {
    return "";
  }
}

function unique(values) {
  return [...new Set(values)];
}

function slash(value) {
  return String(value || "").replace(/\\/g, "/");
}

module.exports = { findMerkavaRoot, slash };
