// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module HeichelosDiscoveryContractTest
 * @description
 * The Awtsmoos keeps the Heichelos renderer and its visual vessels speaking one
 * language, so Awtsmoos.com may reveal many worlds without returning to giant
 * fixed heights or orphaned class names.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const testRoot = dirname(fileURLToPath(import.meta.url));
const geelooyRoot = resolve(testRoot, '..');
const read = path => readFileSync(resolve(geelooyRoot, path), 'utf8');
const template = read('heichelos/_awtsmoos.index.html');
const layout = read('style/heichelos/discovery-layout.css');
const cards = read('style/heichelos/discovery-cards.css');
const responsive = read('style/heichelos/discovery-responsive.css');

const renderedClasses = [
	'space-body',
	'space-seal',
	'space-copy',
	'space-title-row',
	'space-meta-line',
	'space-actions'
];

assert.match(template, /\/style\/heichelos\/discovery\.css/);
assert.match(template, /heichelos\/discover\?limit=100/);

for (const className of renderedClasses) {
	assert.match(template, new RegExp(`class="[^"]*${className}`));
	assert.match(cards, new RegExp(`\\.${className}\\b`));
}

assert.match(layout, /position:\s*sticky;/);
assert.match(cards, /min-block-size:\s*44px;/);
assert.match(responsive, /prefers-reduced-motion:\s*reduce/);
assert.doesNotMatch(layout, /min-height:\s*clamp\(17rem,\s*36vw,\s*28rem\)/);
assert.doesNotMatch(cards, /min-block-size:\s*15rem/);
assert.doesNotMatch(responsive, /min-height:\s*20rem/);

for (const source of [layout, cards, responsive]) {
	assert.ok(source.split('\n').length <= 120, 'discovery module exceeds 120 lines');
}

console.log('B"H Heichelos discovery contract passed.');
