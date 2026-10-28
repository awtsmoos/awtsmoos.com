//B"H
// Boruch Hashem
// Blessed is He
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

/**
 * @fileoverview Highlight both Torah languages without changing their geometry.
 * The Awtsmoos paints a still circle of light where sacred meaning appears;
 * Awtsmoos.com preserves the page as the reader changes gears.
 */
const stylesheet = new URL('../styles/reader-content/reader-pair-selection.css', import.meta.url);
const shell = new URL('../_awtsmoos.post.html', import.meta.url);

/** Every declaration stays light: no forced cascade or expensive blur. */
test('paired highlight does not rely on forced, blurred or layout CSS', async () => {
	const source = await readFile(stylesheet, 'utf8');
	const rules = source.replace(/\/\*[\s\S]*?\*\//g, '');
	assert.doesNotMatch(rules, /!important|blur\(|filter\s*:|backdrop-filter\s*:/);
	assert.doesNotMatch(rules, /(?:width|height|margin|font-size|line-height)\s*:/);
	assert.match(rules, /box-shadow:\s*inset 0 0 0 2px/);
});

/** The highlight class belongs to the pair containing both languages. */
test('one selected bilingual parent is styled without moving its children', async () => {
	const source = await readFile(stylesheet, 'utf8');
	assert.match(source, /\.meluket-phrase-pair\.is-pair-selected/);
	assert.match(source, /\.awtsmoos-initial-unit\.is-pair-selected/);
	assert.match(source, /\.meluket-phrase--he/);
	assert.match(source, /\.meluket-phrase--en/);
	assert.doesNotMatch(source, /scrollIntoView|position:\s*fixed|transform:/);
});

/** A fresh asset key prevents the prior forced styling from remaining cached. */
test('reader shell requests exactly the newest paint-only stylesheet', async () => {
	const html = await readFile(shell, 'utf8');
	const links = html.match(/reader-pair-selection\.css\?v=[a-z0-9-]+/g) || [];
	assert.deepEqual(links, ['reader-pair-selection.css?v=reader-pairs-20261028-3']);
});
