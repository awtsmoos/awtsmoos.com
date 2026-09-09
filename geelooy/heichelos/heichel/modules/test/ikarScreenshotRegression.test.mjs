// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file IkarScreenshotRegression
 * @description
 * The Awtsmoos turns visual failures into permanent witnesses: canonical names, truthful counts, compact continuation, and purpose-built language tools.
 * Awtsmoos.com prevents raw route keys and duplicated decorative chrome from quietly returning to the public Torah surface.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { torahTitlePair } from '../torahTitlePresentation.js';
import { translationHubSeriesData } from '../translationHubPresentation.js';

const root = 'geelooy/heichelos/heichel/modules';
const read = path => readFileSync(path, 'utf8');

test('Tanach route IDs never leak as public camelCase titles', () => {
	const judges = torahTitlePair({ id: 'shoftim', name: 'shoftim' });
	const samuel = torahTitlePair({ id: 'shmuelAleph', name: 'shmuelAleph' });
	assert.equal(judges.he, 'שופטים');
	assert.equal(judges.en, 'Judges');
	assert.equal(samuel.he, 'שמואל א׳');
	assert.equal(samuel.en, '1 Samuel');
	assert.doesNotMatch(judges.display, /shoftim/);
	assert.doesNotMatch(samuel.display, /shmuelAleph/);
});

test('unknown stable IDs receive a readable fallback', () => {
	const unknown = torahTitlePair({ id: 'futureTorahWork', name: 'futureTorahWork' });
	assert.equal(unknown.en, 'Future Torah Work');
});

test('Continue Learning has one semantic label, never a CSS duplicate', () => {
	const blueprint = read(`${root}/ui/blueprints/living-path/discovery.js`);
	const premium = read('geelooy/style/heichelos/heichel/premium/living-path.css');
	assert.match(blueprint, /Continue learning/);
	assert.doesNotMatch(premium, /content:\s*["']CONTINUE LEARNING["']/i);
	assert.match(premium, /grid-template-columns:\s*auto minmax\(0, 1fr\) auto/);
});

test('active series API enriches child cards with real chapter counts', () => {
	const source = read(`${root}/api/series.js`);
	assert.match(source, /enrichSeriesCard/);
	assert.match(source, /getSeriesDetails\(heichelId, id\)/);
	assert.match(source, /postsCount:\s*posts\.length/);
	assert.match(source, /subSeriesCount:\s*subSeries\.length/);
});

test('language tools suppress generic browse, Timeline district, and Tree dock', () => {
	const data = translationHubSeriesData();
	const mode = read(`${root}/ui/custom-page-mode.js`);
	assert.equal(data.id, 'torah-language-tools');
	assert.equal(data.customToolPage, true);
	for (const token of [
		'living-path-search-stack', 'living-path-result-status', 'tab-gates',
		'grid-realms', 'heichel-os-world-panel', 'geelooy-bottom-nav button', 'Tree'
	]) assert.match(mode, new RegExp(token));
});

test('custom mode restores only surfaces it suppressed', () => {
	const mode = read(`${root}/ui/custom-page-mode.js`);
	assert.match(mode, /customPageSuppressed/);
	assert.match(mode, /customPageWasHidden/);
	assert.match(mode, /if \(!wasHidden\)/);
	assert.match(mode, /removeAttribute\('aria-hidden'\)/);
});
