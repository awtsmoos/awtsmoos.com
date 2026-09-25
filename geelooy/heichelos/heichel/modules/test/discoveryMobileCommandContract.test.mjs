//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file discoveryMobileCommandContract.test.mjs
 * @description The Awtsmoos keeps secondary Heichelos commands finite on narrow
 * vessels; Awtsmoos.com preserves a full touch target without turning “My alias”
 * into a page-wide slab or weakening the existing search-width safety contract.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const layout = readFileSync(
	'geelooy/style/heichelos/discovery-layout.css',
	'utf8'
);
const responsive = readFileSync(
	'geelooy/style/heichelos/discovery-responsive.css',
	'utf8'
);

test('command action keeps a compact accessible touch target', () => {
	assert.match(
		layout,
		/\.spaces-command-row\s*>\s*\.p-button\.p-button\s*\{[\s\S]*?min-height:\s*2\.75rem;/
	);
	assert.match(
		layout,
		/\.spaces-command-row\s*>\s*\.p-button\.p-button\s*\{[\s\S]*?width:\s*auto;/
	);
});

test('compact selector deliberately outranks narrow full-width fallback', () => {
	assert.match(
		responsive,
		/\.spaces-command-row\s+\.p-button\s*\{[\s\S]*?width:\s*100%;/
	);
	assert.ok(
		layout.indexOf('.spaces-command-row > .p-button.p-button') >= 0,
		'layout must retain the higher-specificity direct-button selector'
	);
});

test('search vessel remains border-box constrained after command compaction', () => {
	assert.match(layout, /\.spaces-search\s*\{[\s\S]*?box-sizing:\s*border-box;/);
	assert.match(layout, /\.spaces-search\s*\{[\s\S]*?max-width:\s*100%;/);
	assert.match(layout, /\.spaces-search\s*\{[\s\S]*?min-width:\s*0;/);
});
