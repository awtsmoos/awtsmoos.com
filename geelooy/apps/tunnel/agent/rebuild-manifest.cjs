// B"H
const fs = require("fs");
const path = require("path");

/**
 * B"H
 * Chapter 57: The manifest stopped packing its own proving ground.
 *
 * Installer packages must contain the runtime vessel, not the laboratory that
 * tests the vessel. Testing folders stay in source and regression runners.
 */
const ROOT = __dirname;
const REPO_ROOT = path.resolve(ROOT, "../../../..");
const OUT = path.join(ROOT, "manifest.txt");
const VERSION = process.env.AWTSMOOS_AGENT_MANIFEST_VERSION || "1.0.55";
const SKIP_DIRS = new Set(["node_modules", ".git", ".awtsmoos", ".cache", "testing", "test", "tests"]);
const SKIP_NAMES = new Set(["manifest.txt"]);
const EXTERNAL_DIRS = [
  { source: path.join(REPO_ROOT, "geelooy/ai/relay/split-browser"), dest: "ai/relay/split-browser" }
];

function slash(value) { return String(value || "").replace(/\\/g, "/"); }
function ignored(full, name) {
  if (SKIP_NAMES.has(name) || SKIP_DIRS.has(name)) return true;
  const s = slash(full);
  return /(^|\/)testing(\/|$)/.test(s) || /(^|\/)tests(\/|$)/.test(s) || /(^|\/)test(\/|$)/.test(s) || /\.test\.(cjs|mjs|js)$/.test(s) || /\/\.tmp-/.test(s) || /\/\.smoke-server/.test(s);
}
function walk(dir, out = [], base = ROOT, prefix = "") {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const full = path.join(dir, entry.name);
    if (ignored(full, entry.name)) continue;
    if (entry.isDirectory()) walk(full, out, base, prefix);
    else if (entry.isFile()) out.push(slash(path.join(prefix, path.relative(base, full))));
  }
  return out;
}
function agentFiles() { return walk(ROOT).sort((a, b) => a.localeCompare(b)); }
function externalFiles() {
  const out = [];
  for (const item of EXTERNAL_DIRS) walk(item.source, out, item.source, item.dest);
  return out.sort((a, b) => a.localeCompare(b));
}
function buildManifest() {
  const files = [...new Set([...agentFiles(), ...externalFiles()])].sort((a, b) => a.localeCompare(b));
  const lines = ['B"H', VERSION, 'main.js', '', ...files];
  return { files, text: lines.join("\n") + "\n" };
}
function main() {
  const built = buildManifest();
  fs.writeFileSync(OUT, built.text, "utf8");
  console.log(JSON.stringify({ ok: true, manifest: slash(path.relative(process.cwd(), OUT)), version: VERSION, files: built.files.length }, null, 2));
}

if (require.main === module) main();
module.exports = { buildManifest, walk, slash, agentFiles, externalFiles, ignored };
