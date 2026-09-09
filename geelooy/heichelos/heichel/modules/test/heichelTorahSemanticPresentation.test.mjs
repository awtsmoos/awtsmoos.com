// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HeichelTorahSemanticPresentation
 * @description
 * The Awtsmoos proves no-JS semantic Torah uses the same canonical title and root presentation as the browser;
 * Awtsmoos.com therefore never exposes raw Bavli underscores, glued volume IDs, or a root that forgets Chassidus before hydration.
 */

import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';

const require = createRequire(import.meta.url);
const { buildSemanticModel } = require('../../../routes/heichel/semantic.js');
const { prepareTorahSeriesItems } = require('../../../routes/heichel/torahSemanticPresentation.js');

/** Removes bidi isolation controls so visible-text assertions remain readable. */
function visible(value) {
	return String(value).replace(/[\u2066\u2067\u2069]/g, '');
}

/** Builds the minimal public Heichel record used by semantic title tests. */
function ikar() {
	return { id: 'ikar', name: 'Ikar', description: 'Torah' };
}

test('semantic headings use canonical Tanach and numbered Chassidus titles', async () => {
	const genesis = await buildSemanticModel({
		heichel: ikar(),
		series: { id: 'bereishis', name: 'bereishis' },
		heichelId: 'ikar',
		seriesId: 'bereishis'
	});
	const volume = await buildSemanticModel({
		heichel: ikar(),
		series: { id: 'likkuteiSichosVolume39', name: 'likkuteiSichosVolume39' },
		heichelId: 'ikar',
		seriesId: 'likkuteiSichosVolume39'
	});
	assert.match(visible(genesis.heading), /בראשית.*Genesis/);
	assert.equal(visible(genesis.heading).includes('bereishis'), false);
	assert.match(visible(volume.heading), /לקוטי שיחות חלק 39.*Likkutei Sichos, Vol\. 39/);
	assert.equal(visible(volume.heading).includes('Volume39'), false);
});

test('semantic discovery promotes Chassidus and canonizes Bavli child links', async () => {
	const root = await prepareTorahSeriesItems('ikar', 'root', [
		{ id: 'theWrittenTorah', name: 'The Written Torah' },
		{ id: 'theOralTorah', name: 'The Oral Torah' }
	]);
	const bavli = await prepareTorahSeriesItems('ikar', 'talmudBavli', [
		{ id: 'rosh_hashanah', name: 'Rosh_hashanah' },
		{ id: 'bava_kamma', name: 'Bava_kamma' }
	]);
	const rootIds = root.map(item => item.id);
	assert.deepEqual(rootIds, ['theWrittenTorah', 'theOralTorah', 'chassidus']);
	assert.match(visible(root.find(item => item.id === 'chassidus').title), /חסידות.*Chassidus/);
	assert.match(visible(bavli[0].title), /ראש השנה.*Rosh Hashanah/);
	assert.match(visible(bavli[1].title), /בבא קמא.*Bava Kamma/);
	assert.equal(bavli.some(item => item.title.includes('_')), false);
});

test('non-Ikar semantic series preserve their stored public names', async () => {
	const items = await prepareTorahSeriesItems('another-heichel', 'root', [
		{ id: 'custom_series', name: 'Custom_series' }
	]);
	assert.equal(items[0].title, 'Custom_series');
});
