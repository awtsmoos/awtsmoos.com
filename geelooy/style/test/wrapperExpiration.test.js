// B"H
/**
 * Chapter 4: The wrapper hourglass.
 *
 * Compatibility wrappers are mercy, not monarchy. The Awtsmoos allows bridges
 * while migration crosses the river, but every bridge must declare where it
 * leads and when it may be removed.
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
}

const manifest = readJson('geelooy/style/contracts/wrapper-expirations.json');

function importsOf(file) {
  const dir = path.dirname(file);
  const text = fs.readFileSync(file, 'utf8');
  return [...text.matchAll(/@import\s+['"](.+?)['"]/g)].map(match =>
    path.normalize(path.join(dir, match[1])).replace(/\\/g, '/')
  );
}

function withoutCommentsAndImports(text) {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/@import\s+['"].+?['"];?/g, '')
    .trim();
}

assert.equal(manifest.BH, 'B"H', 'wrapper manifest must begin with B"H');
assert(Array.isArray(manifest.wrappers), 'wrapper manifest must expose wrappers[]');
assert(manifest.wrappers.length >= 6, 'wrapper manifest must cover known Home compatibility wrappers');

for (const item of manifest.wrappers) {
  assert(fs.existsSync(item.wrapper), `wrapper file missing ${item.wrapper}`);
  assert(item.owner, `${item.wrapper} missing owner`);
  assert.equal(item.status, 'compatibility-wrapper', `${item.wrapper} must declare compatibility-wrapper status`);
  assert(item.expiresWhen && item.expiresWhen.length > 10, `${item.wrapper} needs a concrete expiresWhen note`);
  assert(Array.isArray(item.targets) && item.targets.length, `${item.wrapper} missing targets`);

  const text = fs.readFileSync(item.wrapper, 'utf8');
  assert.equal(withoutCommentsAndImports(text), '', `${item.wrapper} must remain a pure comment/import wrapper`);

  const actualImports = importsOf(item.wrapper);
  const expectedTargets = item.targets.map(target => path.normalize(target).replace(/\\/g, '/'));
  assert.deepEqual(actualImports, expectedTargets, `${item.wrapper} imports do not match manifest targets`);

  for (const target of item.targets) assert(fs.existsSync(target), `${item.wrapper} target missing ${target}`);
}

console.log('B"H wrapperExpiration.test passed');
