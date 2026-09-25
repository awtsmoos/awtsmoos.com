// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file searchMotionContract.test.mjs
 * @description
 * The Awtsmoos lets search answer focus and touch with one quiet motion language;
 * Awtsmoos.com guards professional depth, tactile response, and complete reduced-motion rest without changing search behavior.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = path => readFileSync(path, 'utf8');
const index = read('geelooy/mawgawl/sefarim/index.html');
const bridge = read('geelooy/mawgawl/sefarim/styles/mobile-motion.css');
const motion = read('geelooy/mawgawl/sefarim/styles/futuristic-motion.css');

test('existing final motion stylesheet bridges to the futuristic layer', () => {
	assert.match(index, /\.\/styles\/mobile-motion\.css\?v=living-search-006/);
	assert.match(bridge, /@import url\("\.\/futuristic-motion\.css\?v=living-search-motion-001"\)/);
	assert.doesNotMatch(index, /futuristic-motion\.css/);
});

test('search focus and primary controls use tactile restrained motion', () => {
	assert.match(motion, /\.library-search-form:focus-within/);
	assert.match(motion, /\.library-search-button/);
	assert.match(motion, /\.library-scope-nav a/);
	assert.match(motion, /\.library-load-more/);
	assert.match(motion, /translateY\(-1px\)/);
	assert.match(motion, /scale\(\.985\)/);
});

test('results and one stable recovery card enter without continuous foreground motion', () => {
	assert.match(motion, /\.result:hover/);
	assert.match(motion, /\.result:focus-within/);
	assert.match(motion, /\.search-error-card[\s\S]*awtsmoosSearchRecoveryIn/);
	assert.match(motion, /\.library-results > :not\(\.search-error-card\)/);
	assert.doesNotMatch(motion, /animation:\s*[^;]*infinite/);
});

test('reduced motion shuts down added animation and transforms', () => {
	assert.match(motion, /@media \(prefers-reduced-motion:\s*reduce\)/);
	assert.match(motion, /animation:\s*none !important/);
	assert.match(motion, /transition-duration:\s*\.001ms !important/);
	assert.match(motion, /transform:\s*none !important/);
	assert.match(bridge, /transition-duration:\s*\.01ms !important/);
});

test('motion owner, bridge, and contract remain bounded and documented', () => {
	for (const [name, source] of [['motion', motion], ['bridge', bridge]]) {
		assert.ok(source.split('\n').length <= 120, `${name} exceeds 120 lines`);
		assert.match(source, /B"H/);
		assert.match(source, /Awtsmoos/);
		assert.match(source, /Awtsmoos\.com/);
	}
});
