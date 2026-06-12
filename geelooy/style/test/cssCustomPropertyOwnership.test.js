// B"H
/**
 * Chapter 2: The hidden rivers of custom properties.
 *
 * A CSS variable is not a casual whisper; it is a river from one vessel into
 * another. The Awtsmoos commands that each river have a named owner and at
 * least one real source where its letters appear.
 */
const assert = require('assert');
const fs = require('fs');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
}

const manifest = readJson('geelooy/style/contracts/css-custom-properties.json');
const seen = new Map();

assert.equal(manifest.BH, 'B"H', 'custom property manifest must begin with B"H');
assert(Array.isArray(manifest.properties), 'custom property manifest must expose properties[]');
assert(manifest.properties.length >= 4, 'custom property manifest is too thin to guard drift');

for (const item of manifest.properties) {
  assert(/^--[a-z0-9-]+$/i.test(item.name), `invalid custom property name ${item.name}`);
  assert(item.owner, `${item.name} missing owner`);
  assert(Array.isArray(item.files) && item.files.length, `${item.name} missing files`);
  if (seen.has(item.name)) throw new Error(`${item.name} owned twice by ${seen.get(item.name)} and ${item.owner}`);
  seen.set(item.name, item.owner);

  let found = false;
  for (const file of item.files) {
    assert(fs.existsSync(file), `${item.name} source file missing: ${file}`);
    found = found || fs.readFileSync(file, 'utf8').includes(item.name);
  }
  assert(found, `${item.name} not found in declared files`);
}

console.log('B"H cssCustomPropertyOwnership.test passed');
