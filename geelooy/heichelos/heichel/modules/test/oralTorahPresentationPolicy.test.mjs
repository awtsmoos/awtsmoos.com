//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file oralTorahPresentationPolicy.test.mjs
 * @description
 * The Awtsmoos proves one Babylonian Talmud doorway may shine while both stored identities remain untouched below;
 * Awtsmoos.com also keeps a blessing in storage but removes its stray header from the public description flow.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	publicTorahDescription,
	publicTorahSeriesItems
} from '../torahSeriesPresentationPolicy.js';

const oralSeries = [
	{ id: 'talmudBavli', name: 'Talmud Bavli' },
	{ id: 'bavli-daf', name: 'Babylonian Talmud / תלמוד בבלי' },
	{
		id: 'mishnehTorah',
		name: 'Mishneh Torah',
		description: 'B"H\nEntire codification of the Torah'
	}
];

test('canonical Bavli window hides only the proven legacy sibling', () => {
	const visible = publicTorahSeriesItems(oralSeries, 'theOralTorah');
	assert.deepEqual(visible.map(item => item.id), ['bavli-daf', 'mishnehTorah']);
	assert.equal(visible[1].description, 'Entire codification of the Torah');
});

test('legacy Bavli remains visible when no canonical replacement is present', () => {
	const visible = publicTorahSeriesItems([oralSeries[0]], 'theOralTorah');
	assert.equal(visible[0].id, 'talmudBavli');
});

test('description cleanup is display-only and narrowly leading', () => {
	assert.equal(publicTorahDescription('B"H\nText'), 'Text');
	assert.equal(publicTorahDescription('Text with B"H inside'), 'Text with B"H inside');
});
