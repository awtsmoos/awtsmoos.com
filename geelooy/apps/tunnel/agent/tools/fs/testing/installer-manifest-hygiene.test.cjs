// B"H
const assert = require("assert");
const fs = require("fs");
const path = require("path");

const agentRoot = path.resolve(__dirname, "../../..");
const geelooyRoot = path.resolve(agentRoot, "../../..");
const manifestPath = path.join(agentRoot, "manifest.txt");
const forbiddenNames = new Set(["manifest.txt", "testing"]);
const relaySplitBrowser = path.join(geelooyRoot, "ai/relay/split-browser");

/**
 * B"H
 * Chapter 429: smoke files are sparks of tests, not installer vessels.
 * This mirrors buildManifest.mjs and rebuild-manifest.cjs exclusions.
 */
function skip(rel, name) {
  return forbiddenNames.has(name) || rel.includes("/.tmp-") || rel.includes("/.smoke-server") || rel.endsWith(".test.cjs") || rel.endsWith(".test.js") || rel.endsWith(".map");
}
function walk(dir, base, prefix = "") {
  let files = [];
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    const rel = path.join(prefix, path.relative(base, full)).replace(/\\/g, "/");
    if (skip(rel, entry.name)) continue;
    if (entry.isDirectory()) files = files.concat(walk(full, base, prefix));
    else if (entry.isFile()) files.push(rel);
  }
  return files.sort();
}
function walkRelayFiles() { return walk(relaySplitBrowser, relaySplitBrowser, "ai/relay/split-browser").filter(file => /\.(cjs|js)$/.test(file)); }
function parseManifest(text) {
  const lines = text.split(/\r?\n/).map(line => line.trim()).filter(Boolean).filter(line => line !== 'B"H' && line !== '# B"H');
  return { version: lines[0], entry: lines[1], files: lines.slice(2) };
}

const raw = fs.readFileSync(manifestPath, "utf8");
const parsed = parseManifest(raw);
const actual = [...new Set([...walk(agentRoot, agentRoot), ...walkRelayFiles()])].sort();

assert.match(parsed.version, /^\d+\.\d+\.\d+$/);
assert.strictEqual(parsed.entry, "main.js");
assert.deepStrictEqual(parsed.files, actual);
assert.ok(parsed.files.includes("tools/fs/connectedFiles.js"), "connectedFiles.js must be installed");
assert.ok(!parsed.files.some(file => file.includes("connected-files-pagination-stress")), "stress tests must not ship");
assert.ok(!raw.split("\n").some(line => line !== line.trimEnd()), "manifest has trailing whitespace");
for (const file of parsed.files) {
  assert.ok(!/^\//.test(file), `absolute path forbidden: ${file}`);
  assert.ok(!file.includes(".."), `parent traversal forbidden: ${file}`);
  assert.ok(!/\s/.test(file), `whitespace forbidden: ${file}`);
}
console.log(`B\"H manifest ${parsed.version} is clean with ${parsed.files.length} files.`);
