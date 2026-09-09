//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file Server-first Torah semantic policy regressions.
 * @description
 * The Awtsmoos proves public Torah identity remains canonical when optional API
 * metadata disappears. Awtsmoos.com also refuses sentinel descriptions, duplicate
 * Chassidus doorways, or lexicographic page ordering from leaking into no-JS study.
 */

import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';

const require = createRequire(import.meta.url);
const { buildSemanticModel } = require('../../../routes/heichel/semantic.js');
const { prepareTorahSeriesItems } = require('../../../routes/heichel/torahSemanticPresentation.js');
const { orderTorahPosts } = require('../../../routes/heichel/torahSemanticPolicy.js');

/** Removes bidi isolation controls from human-visible title testimony. */
function visible(value) {
	return String(value).replace(/[\u2066\u2067\u2069]/g, '');
}

/** Builds one minimal Ikar identity with a truthful fallback description. */
function ikar() {
	return { id: 'ikar', name: 'Ikar', description: 'Torah library' };
}

test('route identity canonizes a series even when optional metadata is absent', async () => {
	const semantic = await buildSemanticModel({
		heichel: ikar(),
		series: null,
		heichelId: 'ikar',
		seriesId: 'bereishis'
	});

	assert.match(visible(semantic.heading), /בראשית.*Genesis/);
	assert.equal(semantic.hasSeries, true);
	assert.match(semantic.canonicalPath, /\/series\/bereishis$/);
});

test('sentinel descriptions fall through to meaningful Heichel testimony', async () => {
	const semantic = await buildSemanticModel({
		heichel: ikar(),
		series: {
			id: 'berakhot',
			name: 'Berakhot',
			description: 'undefined'
		},
		heichelId: 'ikar',
		seriesId: 'berakhot'
	});

	assert.equal(semantic.description, 'Torah library');
	assert.equal(semantic.description.includes('undefined'), false);
});

test('Oral Torah does not repeat the root-featured Chassidus doorway', async () => {
	const items = await prepareTorahSeriesItems('ikar', 'theOralTorah', [
		{ id: 'mishnah', name: 'Mishnah' },
		{ id: 'chassidus', name: 'Chassidus' }
	]);

	assert.deepEqual(items.map(item => item.id), ['mishnah']);
});

test('explicit page-number teachings use natural order without generic reordering', () => {
	const pages = orderTorahPosts('ikar', [
		{ title: 'Likkutei Sichos Volume 1, page 102' },
		{ title: 'Likkutei Sichos Volume 1, page 15' },
		{ title: 'Likkutei Sichos Volume 1, page 1' },
		{ title: 'Likkutei Sichos Volume 1, page 4' }
	]);
	const ordinary = orderTorahPosts('ikar', [
		{ title: 'Zeraim' },
		{ title: 'Moed' }
	]);

	assert.deepEqual(pages.map(item => item.title), [
		'Likkutei Sichos Volume 1, page 1',
		'Likkutei Sichos Volume 1, page 4',
		'Likkutei Sichos Volume 1, page 15',
		'Likkutei Sichos Volume 1, page 102'
	]);
	assert.deepEqual(ordinary.map(item => item.title), ['Zeraim', 'Moed']);
});
