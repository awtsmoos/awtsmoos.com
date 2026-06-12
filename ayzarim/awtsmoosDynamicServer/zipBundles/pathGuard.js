// B"H
const path = require("path");

const SKIP_DIRS = new Set(["node_modules", ".git", ".awtsmoos", ".cache"]);
const SECRET_NAMES = new Set([".env", "id_rsa", "id_dsa", "id_ecdsa", "id_ed25519"]);

/**
 * B"H
 * The bundle may serve the public agent, never the hidden chambers around it.
 */
function cleanRel(value) {
  const rel = String(value || "").trim().replace(/\\/g, "/").replace(/^\/+/, "");
  if (!rel || rel.includes("\0") || rel.split("/").includes("..")) return null;
  if (rel.split("/").some(part => SKIP_DIRS.has(part) || SECRET_NAMES.has(part))) return null;
  return rel;
}

function inside(root, rel) {
  const clean = cleanRel(rel);
  if (!clean) return null;
  const full = path.resolve(root, clean);
  const base = path.resolve(root);
  const diff = path.relative(base, full);
  if (diff.startsWith("..") || path.isAbsolute(diff)) return null;
  return full;
}

module.exports = { cleanRel, inside };
