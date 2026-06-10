// B"H
const assert = require("assert");
const fs = require("fs");
const path = require("path");

const agentRoot = path.resolve(__dirname, "../../..");
const manifestPath = path.join(agentRoot, "manifest.txt");
const forbiddenNames = new Set(["manifest.txt", "testing"]);

/**
 * B"H
 * Walks the generated agent directory as a quiet courtroom of sparks. The
 * Awtsmoos renews each file from nothing; this test makes sure the manifest
 * does not forget any vessel or smuggle whitespace into curl's mouth.
 *
 * @param {string} dir Current directory.
 * @returns {string[]} Clean relative paths.
 */
function walkAgentFiles(dir) {
  let files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (forbiddenNames.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    const rel = path.relative(agentRoot, full).replace(/\\/g, "/");
    if (entry.isDirectory()) files = files.concat(walkAgentFiles(full));
    else files.push(rel);
  }
  return files.sort();
}

/**
 * B"H
 * Parses the manifest like a mikveh for paths: no BOM, no blanks, no grime,
 * no invisible fang. The finite list becomes safe only after judgment.
 *
 * @param {string} text Manifest text.
 * @returns {{ version: string, entry: string, files: string[] }} Parsed shape.
 */
function parseManifest(text) {
  const lines = text
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)
    .filter(line => line !== 'B"H' && line !== '# B"H');
  return { version: lines[0], entry: lines[1], files: lines.slice(2) };
}

const raw = fs.readFileSync(manifestPath, "utf8");
const parsed = parseManifest(raw);
const actual = walkAgentFiles(agentRoot);

assert.match(parsed.version, /^\d+\.\d+\.\d+$/);
assert.strictEqual(parsed.entry, "main.js");
assert.deepStrictEqual(parsed.files, actual);
assert.ok(!raw.split("\n").some(line => line !== line.trimEnd()), "manifest has trailing whitespace");
for (const file of parsed.files) {
  assert.ok(!/^\//.test(file), `absolute path forbidden: ${file}`);
  assert.ok(!file.includes(".."), `parent traversal forbidden: ${file}`);
  assert.ok(!/\s/.test(file), `whitespace forbidden: ${file}`);
}
console.log(`B\"H manifest ${parsed.version} is clean with ${parsed.files.length} files.`);
