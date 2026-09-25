// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ikarSectionListUxContract.test.mjs
 * @description
 * The Awtsmoos lets every visible Torah card already be its destination;
 * Awtsmoos.com guards dense geometry, native anchors, disciplined motion, and reduced-motion peace.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = path => readFileSync(path, 'utf8');
const bundle = read('geelooy/style/heichelos/heichel/premium/ikar-first.css');
const cards = read('geelooy/style/heichelos/heichel/premium/ikar-first-parts/part-03.css');
const actions = read('geelooy/style/heichelos/heichel/premium/ikar-first-parts/part-04.css');
const mobile = read('geelooy/style/heichelos/heichel/premium/ikar-first-parts/part-06.css');
const motion = read('geelooy/style/heichelos/heichel/premium/ikar-first-parts/part-07.css');
const fallback = read('geelooy/heichelos/heichel/semantic/fallback.html');
const enhancer = read('geelooy/heichelos/heichel/ikar-first.js');
const search = read('geelooy/heichelos/heichel/ikar-search.js');

test('semantic fallback keeps each Torah section as a real anchor', () => {
	assert.match(fallback, /<li data-heichel-discovery-kind=/);
	assert.match(fallback, /<a href=\\"" \+ \(item\.path \|\| path\)/);
	assert.match(fallback, /heichel-semantic-discovery/);
});

test('section anchor fills the card with compact flexible geometry', () => {
	assert.match(cards, /grid-template-columns:\s*auto minmax\(0,\s*1fr\) auto/);
	assert.match(cards, /inline-size:\s*100%/);
	assert.match(cards, /min-height:\s*4\.35rem/);
	assert.match(cards, /padding:\s*\.72rem \.82rem/);
	assert.match(cards, /li\[hidden\][\s\S]*display:\s*none !important/);
	assert.doesNotMatch(cards, /min-height:\s*5\.1rem/);
});

test('ordinal and keyboard focus stay visible without oversized decoration', () => {
	assert.match(actions, /height:\s*1\.9rem/);
	assert.match(actions, /width:\s*1\.9rem/);
	assert.match(actions, /a:focus-visible[\s\S]*outline:\s*2px solid #67e8f9/);
	assert.match(actions, /ikar-first-search \+ \.heichel-semantic-discovery/);
});

test('mobile keeps root identity while compressing nested Torah browsing', () => {
	assert.match(mobile, /\[data-ikar-root\] #heichel-boot-title/);
	assert.match(mobile, /:not\(\[data-ikar-root\]\) #heichel-boot-title/);
	assert.match(mobile, /grid-template-columns:\s*minmax\(0,\s*1fr\)/);
	assert.match(mobile, /min-height:\s*4rem/);
	assert.match(mobile, /gap:\s*\.5rem/);
});

test('futuristic motion stays centralized, subtle, and reduced-motion safe', () => {
	assert.match(bundle, /part-07\.css/);
	assert.match(motion, /--ikar-ease-out:/);
	assert.match(motion, /animation:\s*ikarGridDrift 32s linear infinite/);
	assert.match(motion, /\.ikar-first-search:focus-within/);
	assert.match(motion, /transform:\s*translateY\(-2px\)/);
	assert.match(motion, /transform:\s*translateY\(0\) scale\(\.988\)/);
	assert.match(motion, /@media \(prefers-reduced-motion:\s*reduce\)/);
	assert.match(motion, /animation:\s*none !important/);
	assert.match(motion, /transform:\s*none !important/);
});

test('navigation remains anchor-native and all focused CSS modules stay bounded', () => {
	assert.doesNotMatch(enhancer, /addEventListener\(['"]click/);
	assert.doesNotMatch(search, /addEventListener\(['"]click/);
	for (const [name, source] of [['cards', cards], ['actions', actions], ['mobile', mobile], ['motion', motion]]) {
		assert.ok(source.split('\n').length <= 120, `${name} exceeds 120 lines`);
		assert.match(source, /B"H/);
		assert.match(source, /Awtsmoos/);
		assert.match(source, /Awtsmoos\.com/);
	}
});
