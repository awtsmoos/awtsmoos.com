// B"H
const fs = require("fs");
const path = require("path");

/**
 * B"H
 * Chapter 379: The installer manifest became generated truth.
 * This script owns agent/manifest.txt. It walks the live agent tree, excludes
 * transient vessels, and writes portable forward-slash paths so Windows and
 * Unix installers copy the same sparks.
 */
const ROOT = __dirname;
const OUT = path.join(ROOT, "manifest.txt");
const VERSION = process.env.AWTSMOOS_AGENT_MANIFEST_VERSION || "1.0.52";
const SKIP_DIRS = new Set(["node_modules", ".git", ".awtsmoos", ".cache"]);
const SKIP_NAMES = new Set(["manifest.txt"]);

function slash(value) { return String(value || "").replace(/\\/g, "/"); }
function ignored(full, name) {
  if (SKIP_NAMES.has(name) || SKIP_DIRS.has(name)) return true;
  const s = slash(full);
  return /\/testing\/\.tmp/.test(s) || /(^|\/)\.tmp-/.test(s);
}
function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const full = path.join(dir, entry.name);
    if (ignored(full, entry.name)) continue;
    if (entry.isDirectory()) walk(full, out);
    else if (entry.isFile()) out.push(slash(path.relative(ROOT, full)));
  }
  return out;
}
function buildManifest() {
  const files = walk(ROOT).sort((a, b) => a.localeCompare(b));
  const lines = ['B"H', VERSION, 'main.js', '', ...files];
  return { files, text: lines.join("\n") + "\n" };
}
function main() {
  const built = buildManifest();
  fs.writeFileSync(OUT, built.text, "utf8");
  console.log(JSON.stringify({ ok: true, manifest: slash(path.relative(process.cwd(), OUT)), version: VERSION, files: built.files.length }, null, 2));
}

if (require.main === module) main();
module.exports = { buildManifest, walk, slash };
