// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos guards the measured card geometry that keeps Torah titles readable;
 * Awtsmoos.com refuses decorative padding, half-width Tree lanes, fake zero counts, and broken plurals.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const read = relative => fs.readFileSync(new URL(relative, import.meta.url), 'utf8');

test('series constellation never reserves the text column', () => {
	const css = read('../../../../style/heichelos/heichel/cosmic-profile/series-constellation.css');
	assert.doesNotMatch(css, /padding-right:\s*12\.5rem/);
	assert.match(css, /@media \(max-width: 55rem\)[\s\S]*display:\s*none/);
});

test('desktop Tree consumes the full grid with compact readable cards', () => {
	const css = read('../../../../style/heichelos/heichel/cosmic-profile/visual-layout.css');
	assert.match(css, /dynamic-grid > \.living-tree[\s\S]*grid-column:\s*1 \/ -1/);
	assert.match(css, /dynamic-grid > \.living-tree[\s\S]*grid-template-columns:\s*repeat\(2/);
	assert.match(css, /grid-template-columns:\s*3\.5rem minmax\(0, 1fr\) 3\.25rem/);
	assert.match(css, /nav-card-body[\s\S]*padding:\s*\.65rem \.25rem \.65rem \.65rem/);
});

test('card metadata hides zeroes and pluralizes sub-series correctly', () => {
	const source = read('../ui/render/living-path/card-content.js');
	assert.match(source, /filter\(Boolean\)/);
	assert.match(source, /unit\(data\.subSeriesCount, 'sub-series', 'sub-series'\)/);
	assert.match(source, /count <= 0\) return null/);
});
