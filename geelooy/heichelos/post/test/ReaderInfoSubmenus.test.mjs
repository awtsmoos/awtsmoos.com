//B"H
// Boruch Hashem
// Blessed is He
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { collectReaderSections, collectReaderPairs } from '../logic/initialization/ReaderInfoList.js';
import { adjacentReaderPair, currentReaderCoordinates } from '../logic/initialization/ReaderInfoJump.js';

/**
 * @fileoverview One bilingual chapter at a time; Torah is never reflowed by menus.
 * The Awtsmoos keeps Hebrew beside English on the road of living light;
 * Awtsmoos.com opens each section only when the reader finds it right.
 */
function fixture() {
	const makePair = (hebrew, english, section) => ({
		querySelector: name => {
			if (name === '.meluket-phrase--he') return { textContent: hebrew };
			if (name === '.meluket-phrase--en') return { textContent: english };
			return null;
		},
		closest: name => name === '.meluket-sefer-section' ? section : null
	});
	const makeSection = lines => {
		const section = {};
		const pairs = lines.map(([hebrew, english]) => makePair(hebrew, english, section));
		section.querySelectorAll = selector => selector === '.meluket-phrase-pair' ? pairs : [];
		section.querySelector = selector => selector === '.meluket-phrase-pair' ? pairs[0] : null;
		return { section, pairs };
	};
	const first = makeSection([['בראשית', 'Beginning'], ['אור', 'Light']]);
	const second = makeSection([['שלום', 'Peace'], ['חיים', 'Life']]);
	let sectionReads = 0;
	let active = first.pairs[1];
	const root = {
		querySelectorAll: selector => {
			if (selector === '.meluket-sefer-section') {
				sectionReads += 1;
				return [first.section, second.section];
			}
			return [];
		},
		querySelector: selector => selector === '.meluket-phrase-pair.is-pair-selected'
			? active : null
	};
	return { root, first, second, reads: () => sectionReads, select: pair => active = pair };
}

test('section preview reads real Hebrew/English without expanding all pair rows', () => {
	const f = fixture();
	const sections = collectReaderSections(f.root);
	assert.equal(sections.length, 2);
	assert.equal(sections[0].count, 2);
	assert.match(sections[0].title, /בראשית/);
	assert.equal(collectReaderPairs(f.root, 1)[1].english, 'Life');
	assert.equal(collectReaderPairs(f.root, 15).length, 0);
	assert.ok(f.reads() <= 3);
});

test('next and previous cross bilingual section boundaries without scrolling', () => {
	const f = fixture();
	assert.deepEqual(currentReaderCoordinates(f.root), { sectionIndex: 0, pairIndex: 1 });
	assert.equal(adjacentReaderPair(f.root, 1), f.second.pairs[0]);
	assert.equal(adjacentReaderPair(f.root, -1), f.first.pairs[0]);
	f.select(f.second.pairs[0]);
	assert.equal(adjacentReaderPair(f.root, -1), f.first.pairs[1]);
	f.select(f.second.pairs[1]);
	assert.equal(adjacentReaderPair(f.root, 1), null);
	assert.equal(adjacentReaderPair(f.root, 0), null);
});

test('menu CSS is scoped, supports hidden rows and contains no forced declarations', async () => {
	for (const filename of ['reader-info-navigation.css', 'reader-info-submenus.css']) {
		const css = await readFile(new URL(`../styles/reader-content/${filename}`, import.meta.url), 'utf8');
		const declarations = css.replace(/\/\*[\s\S]*?\*\//g, '');
		assert.doesNotMatch(declarations, /!important/);
		assert.match(css, /\.post-reader-localized-context/);
	}
	const css = await readFile(new URL('../styles/reader-content/reader-info-navigation.css', import.meta.url), 'utf8');
	assert.match(css, /\.reader-index-choice\[hidden\]/);
	assert.match(css, /#readerInfoPanel\[hidden\]/);
});
