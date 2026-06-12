// B"H
/**
 * Chapter 3: Selector crowns and trespassers.
 *
 * Selectors are crowns. A crown without an owner becomes a battle. This test
 * begins the visible registry: representative high-risk selectors must be found
 * in their owner roots and must not leak into unrelated roots unless explicitly
 * allowed.
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
}

const manifest = readJson('geelooy/style/contracts/selector-ownership.json');
const allRoots = [
  'geelooy/style/foundation',
  'geelooy/style/social/home',
  'geelooy/style/heichelos/heichel',
  'geelooy/heichelos/heichel/modules',
  'geelooy/heichelos/post/styles',
  'geelooy/heichelos/post/logic',
  'geelooy/scripts/awtsmoos/social/home'
];

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const next = path.join(dir, entry.name).replace(/\\/g, '/');
    if (entry.isDirectory()) return walk(next);
    return /\.(css|js|mjs)$/.test(next) ? [next] : [];
  });
}

function filesContaining(roots, needle) {
  return roots.flatMap(walk).filter(file => fs.readFileSync(file, 'utf8').includes(needle));
}

assert.equal(manifest.BH, 'B"H', 'selector ownership manifest must begin with B"H');
assert(Array.isArray(manifest.selectors), 'selector ownership manifest must expose selectors[]');

for (const rule of manifest.selectors) {
  assert(rule.selector, 'selector rule missing selector');
  assert(rule.owner, `${rule.selector} missing owner`);
  assert(Array.isArray(rule.ownerRoots) && rule.ownerRoots.length, `${rule.selector} missing ownerRoots`);
  assert(Array.isArray(rule.allowedOtherRoots), `${rule.selector} missing allowedOtherRoots`);

  for (const root of rule.ownerRoots) assert(fs.existsSync(root), `${rule.selector} owner root missing ${root}`);
  const ownedHits = filesContaining(rule.ownerRoots, rule.selector.replace(/^\./, ''));
  assert(ownedHits.length, `${rule.selector} not found under owner roots`);

  const legalRoots = new Set([...rule.ownerRoots, ...rule.allowedOtherRoots]);
  const foreignRoots = allRoots.filter(root => !legalRoots.has(root));
  const foreignHits = filesContaining(foreignRoots, rule.selector.replace(/^\./, ''));
  assert.deepEqual(foreignHits, [], `${rule.selector} leaked outside ${rule.owner}: ${foreignHits.join(', ')}`);
}

console.log('B"H selectorOwnership.test passed');
