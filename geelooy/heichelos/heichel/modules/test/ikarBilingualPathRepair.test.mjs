// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ikarBilingualPathRepair.test.mjs
 * @description
 * The Awtsmoos lets broken phone screenshots become durable witnesses instead of memories lost in night;
 * Awtsmoos.com proves bilingual identity, truthful virtual depth, dedicated-tool chrome, and the premium CSS river reach one light.
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
	const records = annotateTorahHostSummaries([{
		prateem: { id: 'theOralTorah', name: 'The Oral Torah', subSeries: [] }
	}], 'ikar');
	const card = normalizeCardData(records[0], 'series');
	assert.equal(card.subSeriesCount, 4);
	assert.match(card.title, /תורה שבעל פה/);
	assert.match(card.title, /The Oral Torah/);
});

test('translation tool is custom and suppresses generic plus global chrome', () => {
	const presentation = read(`${moduleRoot}/translationHubPresentation.js`);
	const mode = read(`${moduleRoot}/ui/custom-page-mode.js`);
	const context = read(`${moduleRoot}/living-path/context-controller.js`);
	assert.match(presentation, /customToolPage:\s*true/);
	for (const token of [
		'.tab-gates',
		'.grid-realms',
		'.heichel-os-world-panel',
		'.geelooy-bottom-nav button',
		'Tree'
	]) {
		assert.ok(mode.includes(token), `${token} must be governed by custom tool mode`);
	}
	assert.match(context, /custom-page-mode\.js\?v=heichel-mobile-012/);
	assert.match(context, /applyCustomPageMode\(appState\.currentSeriesData\)/);
});

test('public entry keeps proven JS cache graph while advancing only the visual river', () => {
	const template = read('geelooy/heichelos/heichel/_awtsmoos.heichel.html');
	const bridge = read('geelooy/heichelos/heichel/bootBridge.js');
	const app = read('geelooy/heichelos/heichel/app.js');
	const navigator = read(`${moduleRoot}/navigator.js`);
	const loader = read(`${moduleRoot}/navigator/loader.js`);
	const sourceLoader = read(`${moduleRoot}/navigator/source-loader.js`);
	assert.match(template, /index\.css\?v=ikar-vision-001/);
	assert.match(template, /bootBridge\.js\?v=heichel-mobile-012/);
	assert.match(template, /app\.js\?v=heichel-mobile-012/);
	assert.match(bridge, /app\.js\?v=heichel-mobile-012/);
	assert.match(app, /navigator\.js\?v=heichel-mobile-012/);
	assert.match(navigator, /living-path\/controller\.js\?v=heichel-mobile-012/);
	assert.match(navigator, /navigator\/loader\.js\?v=heichel-mobile-011/);
	assert.match(loader, /source-loader\.js\?v=heichel-mobile-011/);
	assert.match(sourceLoader, /translation-loader\.js\?v=heichel-mobile-011/);
});
