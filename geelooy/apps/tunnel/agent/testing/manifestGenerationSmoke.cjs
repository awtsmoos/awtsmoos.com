// B"H
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const Manifest = require('../rebuild-manifest.cjs');

const ROOT = path.resolve(__dirname, '..');
const MANIFEST = path.join(ROOT, 'manifest.txt');
const REPO_ROOT = path.resolve(ROOT, '../../../..');

function versionFrom(text) {
  return text.split(/\r?\n/).map(x => x.trim()).find(x => /^\d+\.\d+\.\d+$/.test(x)) || '1.0.1';
}

function sourceFor(file) {
  if (file.startsWith('ai/')) return path.resolve(REPO_ROOT, 'geelooy', file);
  if (file.startsWith('ayzarim/')) return path.resolve(REPO_ROOT, file);
  return path.join(ROOT, file);
}

/**
 * B"H
 * The manifest is large because it carries living external vessels too.
 * The test guards against test-harness leakage, not against a strong bundle.
 */
const before = fs.readFileSync(MANIFEST, 'utf8');
const expectedVersion = versionFrom(before);
const generated = Manifest.buildManifest({
  repoRoot: REPO_ROOT,
  version: expectedVersion
});
const after = generated.text;
assert.strictEqual(after, before, 'checked-in manifest is the deterministic current inventory');
const lines = after.split(/\r?\n/).map(x => x.trim()).filter(x => x && x !== 'B"H' && x !== '# B"H');
assert.strictEqual(lines[0], expectedVersion);
assert.strictEqual(lines[1], 'main.js');
const files = lines.slice(2);
assert(files.length >= 240, 'manifest includes runtime files');
assert(files.length < 2000, 'manifest remains bounded');
assert(files.includes('tools/fs/continuation/lease.js'), 'manifest includes continuation lease');
assert(files.includes('tools/fs/actionBuilders.js'), 'manifest includes split action builder');
assert.strictEqual(files.filter(x => /^testing\//.test(x) || /(^|\/)testing\//.test(x) || /\.test\./.test(x)).length, 0);
for (const file of files) assert(fs.existsSync(sourceFor(file)), 'manifest source exists: ' + file);
console.log(JSON.stringify({ ok: true, suite: 'manifest-generation-smoke', files: files.length, changed: false }, null, 2));
