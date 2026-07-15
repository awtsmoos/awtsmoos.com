// B"H
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { agentFiles, externalFiles } = require("../../../rebuild-manifest.cjs");

const agentRoot = path.resolve(__dirname, "../../..");
const manifestPath = path.join(agentRoot, "manifest.txt");

/**
 * B"H
 * Chapter 430: The hygiene witness now follows the same manifest builder as the
 * installer. External living vessels, including split-browser and AwtsmoosDB,
 * are allowed only through rebuild-manifest.cjs; tests and smoke sparks remain
 * forbidden.
 */
function parseManifest(text) {
  const lines = text.split(/\r?\n/).map(line => line.trim()).filter(Boolean).filter(line => line !== 'B"H' && line !== '# B"H');
  return { version: lines[0], entry: lines[1], files: lines.slice(2) };
}

const raw = fs.readFileSync(manifestPath, "utf8");
const parsed = parseManifest(raw);
const actual = [...new Set([...agentFiles(), ...externalFiles()])].sort((a, b) => a.localeCompare(b));

assert.match(parsed.version, /^\d+\.\d+\.\d+$/);
assert.strictEqual(parsed.entry, "main.js");
assert.deepStrictEqual(parsed.files, actual);
assert.ok(parsed.files.includes("tools/fs/connectedFiles.js"), "connectedFiles.js must be installed");
assert.ok(parsed.files.includes("ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js"), "AwtsmoosDB external vessel must ship");
assert.ok(!parsed.files.some(file => file.includes("connected-files-pagination-stress")), "stress tests must not ship");
assert.ok(!raw.split("\n").some(line => line !== line.trimEnd()), "manifest has trailing whitespace");
for (const file of parsed.files) {
  assert.ok(!/^\//.test(file), `absolute path forbidden: ${file}`);
  assert.ok(!file.includes(".."), `parent traversal forbidden: ${file}`);
  assert.ok(!/\s/.test(file), `whitespace forbidden: ${file}`);
  assert.ok(!/(^|\/)testing\//.test(file), `testing directory forbidden: ${file}`);
  assert.ok(!/\.test\.(cjs|mjs|js)$/.test(file), `test file forbidden: ${file}`);
}
console.log(`B\"H manifest ${parsed.version} is clean with ${parsed.files.length} files.`);
