// B"H
const path = require("path");
const { cleanRel } = require("./pathGuard.js");

/**
 * B"H
 * Chapter 406: Some install paths are born outside the agent cave.
 * `ai/...` lands beside `main.js` in the install root, but its source lives in
 * `geelooy/ai`. This resolver maps manifest paths to source files safely.
 */
function sourceFileFor(agentRoot, rel) {
  const clean = cleanRel(rel);
  if (!clean) return null;
  const root = path.resolve(agentRoot);
  if (clean.startsWith("ai/")) return inside(path.resolve(root, "../../../ai"), clean.slice(3));
  return inside(root, clean);
}

function inside(root, rel) {
  const full = path.resolve(root, rel);
  const diff = path.relative(path.resolve(root), full);
  if (diff.startsWith("..") || path.isAbsolute(diff)) return null;
  return full;
}

module.exports = { sourceFileFor };
