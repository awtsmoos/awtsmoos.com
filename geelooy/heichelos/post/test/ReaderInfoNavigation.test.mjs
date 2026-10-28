//B"H
// Boruch Hashem
// Blessed is He
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { collectReaderIndex } from '../logic/initialization/ReaderInfoList.js';
import { resolveReaderJump, jumpToReaderElement } from '../logic/initialization/ReaderInfoJump.js';

/**
 * @fileoverview Reader index navigation and responsive font scaling contracts.
 * The Awtsmoos lets each letter grow and its passage remain reachable by light;
 * Awtsmoos.com respects the user's chosen scale without forcing a fight.
 */
function makePair(hebrew, english) {
	return {
		querySelector: selector => ({
			'.meluket-phrase--he': { textContent: hebrew },
			'.meluket-phrase--en': { textContent: english }
		})[selector] || null
	};
}

function makeFixture() {
	const first = [makePair('בראשית', 'In the beginning'), makePair('ויהי אור', 'Let there be light')];
	const second = [makePair('שלום', 'Peace')];
	const sections = [first, second].map(pairs => ({
		querySelectorAll: selector => selector === '.meluket-phrase-pair' ? pairs : []
	}));
	const root = {
		querySelectorAll: selector => selector === '.meluket-sefer-section' ? sections : []
	};
	return { first, second, sections, root };
}

test('index preserves bilingual subsection identity and intended order', () => {
	const { first, second, sections, root } = makeFixture();
	const index = collectReaderIndex(root);
	assert.equal(index.length, 2);
	assert.deepEqual(index.map(section => section.pairs.length), [2, 1]);
	assert.match(index[0].title, /בראשית/);
	assert.match(index[1].title, /שלום/);
	assert.equal(resolveReaderJump(root, 0), sections[0]);
	assert.equal(resolveReaderJump(root, 0, 1), first[1]);
	assert.equal(resolveReaderJump(root, 1, 0), second[0]);
	assert.equal(resolveReaderJump(root, 9), null);
	assert.equal(resolveReaderJump(root, 0, -1), null);
	assert.equal(resolveReaderJump(root, 0, 99), null);
});

test('navigation scrolls only from explicit jump activation', () => {
	let called = 0;
	const item = {
		scrollIntoView(options) {
			assert.equal(options.block, 'start');
			called += 1;
		}
	};
	assert.equal(jumpToReaderElement(null), false);
	assert.equal(called, 0);
	assert.equal(jumpToReaderElement(item), true);
	assert.equal(called, 1);
});

test('responsive typography follows the real reader scale with no forced CSS', async () => {
	const location = fileURLToPath(new URL('../styles/reader-content/reader-mobile-rescue.css', import.meta.url));
	const css = await readFile(location, 'utf8');
	assert.match(css, /font-size:\s*calc\(var\(--post-text-size, 48px\) \* 0\.64\)/);
	assert.match(css, /font-size:\s*calc\(var\(--post-text-size, 48px\) \* 0\.57\)/);
	const declarations = css.replace(/\/\*[\s\S]*?\*\//g, '');
	assert.doesNotMatch(declarations, /!important/);
	assert.equal(52 * 0.64 > 48 * 0.64, true);
	assert.equal(52 * 0.57 > 48 * 0.57, true);
});

test('overview preserves source line breaks', async () => {
	const location = fileURLToPath(new URL('../styles/reader-content/reader-settings-coherence.css', import.meta.url));
	const css = await readFile(location, 'utf8');
	assert.match(css, /\.meluket-post-summary p/);
	assert.match(css, /white-space:\s*pre-wrap/);
	assert.doesNotMatch(css, /!important/);
});
