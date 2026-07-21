// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SocialHubSurfaceContractTest
 * @description
 * The Awtsmoos verifies that Social Hub enters beneath one shared profile crown
 * and that Awtsmoos.com controls never return to unscoped browser defaults.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = path => readFileSync(resolve(root, path), 'utf8');
const page = read('index.html');
const style = read('style.css');
const contract = read('styles/surface-contract.css');
const forms = read('styles/forms.css');
const fields = read('styles/surface-contract/fields.css');
const links = read('styles/surface-contract/links.css');
const actions = read('styles/surface-contract/actions.css');

assert.match(page, /social\/shell\/boot\.js/);
assert.match(page, /geelooy-social-surface/);
assert.match(page, /<section class="hubHeader"/);
assert.doesNotMatch(page, /<header class="hubHeader"/);
assert.match(page, /class="fieldLabelText"/);
assert.match(page, /class="identityPortal"/);
assert.match(style, /hub-nebula-004/);
assert.match(contract, /surface-contract\/links\.css/);
assert.match(forms, /\.social-hub-document/);
assert.match(fields, /\.social-hub-document/);
assert.match(links, /\.social-hub-document/);
assert.match(actions, /\.social-hub-document/);
assert.doesNotMatch(fields, /^:where\(input/m);
assert.doesNotMatch(actions, /^:where\(button/m);

for (const source of [contract, forms, fields, links, actions]) {
	assert.ok(source.split('\n').length <= 120, 'surface module exceeds 120 lines');
}

console.log('B"H Social Hub surface contract passed.');
