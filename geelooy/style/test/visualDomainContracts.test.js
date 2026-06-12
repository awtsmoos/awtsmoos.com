// B"H
/**
 * Chapter 1: The domain scroll opens.
 *
 * The Awtsmoos creates every visual kingdom from nothing every instant; this
 * test refuses anonymous kingdoms. Every declared design domain must point to
 * real roots, real entry files, and real sentinels, so architecture is not a
 * rumor passed by tired imports in the night.
 */
const assert = require('assert');
const fs = require('fs');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
}

const manifest = readJson('geelooy/style/contracts/visual-domains.json');
const names = new Set();

assert.equal(manifest.BH, 'B"H', 'visual domain manifest must begin with B"H');
assert(Array.isArray(manifest.domains), 'visual domain manifest must expose domains[]');
assert(manifest.domains.length >= 5, 'visual domain manifest must cover foundation, home, heichel, reader, and global-scroll');

for (const domain of manifest.domains) {
  assert(domain.name, 'domain missing name');
  assert(!names.has(domain.name), `duplicate visual domain ${domain.name}`);
  names.add(domain.name);
  assert(domain.owner, `${domain.name} missing owner`);
  assert(Array.isArray(domain.roots) && domain.roots.length, `${domain.name} missing roots`);
  assert(Array.isArray(domain.entryFiles) && domain.entryFiles.length, `${domain.name} missing entry files`);
  assert(Array.isArray(domain.tests) && domain.tests.length, `${domain.name} missing tests`);

  for (const root of domain.roots) {
    assert(fs.existsSync(root), `${domain.name} root does not exist: ${root}`);
  }
  for (const file of domain.entryFiles) {
    assert(fs.existsSync(file), `${domain.name} entry file does not exist: ${file}`);
  }
  for (const file of domain.tests) {
    assert(fs.existsSync(file), `${domain.name} test file does not exist: ${file}`);
  }
}

for (const required of ['foundation', 'home', 'heichel', 'reader', 'global-scroll']) {
  assert(names.has(required), `missing required visual domain ${required}`);
}

console.log('B"H visualDomainContracts.test passed');
