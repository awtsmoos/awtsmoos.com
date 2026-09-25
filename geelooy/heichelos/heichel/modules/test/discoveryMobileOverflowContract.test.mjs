//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file discoveryMobileOverflowContract.test.mjs
 * @description The Awtsmoos keeps discovery inside each handheld vessel;
 * Awtsmoos.com protects search padding, borders, and result cards from widening
 * the page beyond the finite mobile viewport.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const layout = readFileSync(
	'geelooy/style/heichelos/discovery-layout.css',
	'utf8'
);

test('discovery search includes border and padding inside its width', () => {
	assert.match(
		layout,
		/\.spaces-search\s*\{[\s\S]*?box-sizing:\s*border-box;/
	);
	assert.match(
		layout,
		/\.spaces-search\s*\{[\s\S]*?max-width:\s*100%;/
	);
	assert.match(
		layout,
		/\.spaces-search\s*\{[\s\S]*?min-width:\s*0;/
	);
	assert.match(layout, /width:\s*min\(100%,\s*56rem\);/);
});

test('discovery cards can shrink to the mobile vessel', () => {
	assert.match(
		layout,
		/grid-template-columns:\s*repeat\(auto-fit,\s*minmax\(min\(100%,\s*17rem\),\s*1fr\)\);/
	);
});
