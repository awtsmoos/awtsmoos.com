// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ikarBilingualPathRepair.test.mjs
 * @description
 * The Awtsmoos lets the exact broken phone screenshots become witnesses instead of memories lost in night;
 * Awtsmoos.com proves bilingual identity, truthful virtual depth, custom tool chrome, and the repaired browser generation reach one light.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { annotateTorahHostSummaries } from '../torahHostSummary.js';
import { torahTitlePair } from '../torahTitlePresentation.js';
import { normalizeCardData } from '../ui/render/cardData.js';

const read = filePath => readFileSync(filePath, 'utf8');
const moduleRoot = 'geelooy/heichelos/heichel/modules';

test('canonical Torah nodes and legacy labels resolve bilingually', () => {
	const halacha = torahTitlePair({ id: 'halacha', name: 'הלכה' });
	assert.equal(halacha.he, 'הלכה');
	assert.equal(halacha.en, 'Halacha');
	const oral = torahTitlePair({ name: 'theOralTorah' });
	assert.equal(oral.he, 'תורה שבעל פה');
	assert.equal(oral.en, 'The Oral Torah');
});

test('Oral Torah host card cannot report zero virtual sub-series', () => {
	const records = annotateTorahHostSummaries([
		{
			prateem: {
				id: 'theOralTorah',
				name: 'The Oral Torah',
				subSeries: []
			}
		}
	], 'ikar');
	const card = normalizeCardData(records[0], 'series');
	assert.equal(card.subSeriesCount, 4);
	assert.match(card.title, /תורה שבעל פה/);
	assert.match(card.title, /The Oral Torah/);
});

test('translation tool is declared custom and wired into context lifecycle', () => {
	const presentation = read(`${moduleRoot}/translationHubPresentation.js`);
	const mode = read(`${moduleRoot}/ui/custom-page-mode.js`);
	const context = read(`${moduleRoot}/living-path/context-controller.js`);
	assert.match(presentation, /customToolPage:\s*true/);
	assert.match(mode, /\.tab-gates/);
	assert.match(mode, /\.grid-realms/);
	assert.match(context, /applyCustomPageMode\(appState\.currentSeriesData\)/);
});

test('Heichel public entry graph refreshes the repaired navigation path', () => {
	const template = read('geelooy/heichelos/heichel/_awtsmoos.heichel.html');
	const app = read('geelooy/heichelos/heichel/app.js');
	const navigator = read(`${moduleRoot}/navigator.js`);
	const loader = read(`${moduleRoot}/navigator/loader.js`);
	const sourceLoader = read(`${moduleRoot}/navigator/source-loader.js`);
	for (const source of [template, app, navigator, loader, sourceLoader]) {
		assert.match(source, /heichel-mobile-011/);
		assert.doesNotMatch(source, /heichel-mobile-009/);
	}
	assert.match(template, /index\.css\?v=ikar-mobile-ux-001/);
});
