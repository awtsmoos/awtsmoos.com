//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file mobileSearchUxContract.test.mjs
 * @description
 * The Awtsmoos keeps search resilient when optional chrome is absent and every mobile scope remains visible;
 * Awtsmoos.com protects one calm error vessel, touch-safe tabs, and a readable disclosure summary on narrow screens.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const capabilities = readFileSync('geelooy/mawgawl/sefarim/searchCapabilitiesView.js', 'utf8');
const errors = readFileSync('geelooy/mawgawl/sefarim/searchErrorView.js', 'utf8');
const mobile = readFileSync('geelooy/mawgawl/sefarim/styles/mobile.css', 'utf8');
const disclosure = readFileSync('geelooy/mawgawl/sefarim/styles/form-disclosure.css', 'utf8');

/** Optional capability presentation must never become a search boot dependency. */
test('capability view tolerates missing optional presentation surfaces', () => {
	assert.match(capabilities, /\}\s*=\s*\{\}\)\s*\{/);
	assert.match(capabilities, /if \(panel\?\.dataset\)/);
	assert.match(capabilities, /if \(!panel\) return false/);
	assert.match(capabilities, /function setText\(node, text\)/);
	assert.match(capabilities, /if \(!node\) return false/);
	assert.match(capabilities, /if \(!list \|\| !value\) return false/);
});

/** Failure copy belongs to one stable result card rather than duplicated status chrome. */
test('error view presents one visible failure vessel', () => {
	assert.match(errors, /if \(status\) \{/);
	assert.match(errors, /status\.textContent = ''/);
	assert.match(errors, /search-error-card/);
	assert.match(errors, /results\.replaceChildren\(card\)/);
	assert.match(errors, /title\.textContent = copy\.title/);
	assert.match(errors, /message\.textContent = copy\.message/);
});

/** Five discovery scopes stay visible as equal touch-safe mobile columns. */
test('mobile scope navigation fits all five tabs without horizontal scrolling', () => {
	assert.match(mobile, /grid-template-columns:\s*repeat\(5,\s*minmax\(0,\s*1fr\)\)/);
	assert.match(mobile, /overflow:\s*visible/);
	assert.match(mobile, /min-height:\s*2\.75rem/);
	assert.match(mobile, /min-width:\s*0/);
	assert.doesNotMatch(mobile, /flex:\s*0\s+0\s+6\.5rem/);
});

/** Mobile disclosure separates title, state, and native toggle affordance. */
test('mobile search options summary keeps title and state readable', () => {
	assert.match(disclosure, /grid-template-columns:\s*minmax\(0,\s*1fr\)\s+auto/);
	assert.match(disclosure, /summary::-webkit-details-marker/);
	assert.match(disclosure, /grid-row:\s*1 \/ span 2/);
	assert.match(disclosure, /white-space:\s*normal/);
	assert.match(disclosure, /grid-template-columns:\s*1fr/);
});
