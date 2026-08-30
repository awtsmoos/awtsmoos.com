// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ChitasLivingPathContractTest
 * @description
 * The Awtsmoos joins computed study to the existing road without granting phantom ownership or unsafe escape;
 * Awtsmoos.com proves Ikar-only grouping, virtual loading, trusted Chabad navigation, and compact modules in shape.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { injectChitasGrouping } from '../../geelooy/heichelos/heichel/modules/chitas/virtual-series.js';

const read = file => readFileSync(file, 'utf8');
const loaderPath = 'geelooy/heichelos/heichel/modules/navigator/loader.js';
const cardsPath = 'geelooy/heichelos/heichel/modules/ui/render/living-path/cards.js';
const controlsPath = 'geelooy/heichelos/heichel/modules/ui/render/controls.js';
const governancePaths = [
	'geelooy/heichelos/heichel/modules/ui/render/governance/control-plan.js',
	'geelooy/heichelos/heichel/modules/ui/render/governance/create-controls.js',
	'geelooy/heichelos/heichel/modules/ui/render/governance/series-controls.js'
];
const loader = read(loaderPath);
const cards = read(cardsPath);
const controls = read(controlsPath);

const rootGroups = injectChitasGrouping([], 'ikar', 'root');
assert.equal(rootGroups.length, 1);
assert.equal(rootGroups[0].id, 'daily-chitas');
assert.equal(rootGroups[0].type, 'grouping');
assert.equal(injectChitasGrouping([], 'other', 'root').length, 0);
assert.equal(injectChitasGrouping([], 'ikar', 'child').length, 0);
assert.equal(injectChitasGrouping(rootGroups, 'ikar', 'root').length, 1);

assert.match(loader, /isChitasSeries\(seriesId\)/);
assert.match(loader, /loadChitasVirtualSeries\(\)/);
assert.match(loader, /injectChitasGrouping/);
assert.match(loader, /seriesData\?\.virtual\) return 'posts'/);
assert.match(loader, /appState\.ownsIt && !seriesData\?\.virtual/);

assert.match(cards, /CHABAD_STUDY_HOST = 'www\.chabad\.org'/);
assert.match(cards, /CHABAD_STUDY_PATH = '\/dailystudy\/'/);
assert.match(cards, /data\.raw\?\.virtualStudy/);
assert.match(cards, /trustedExternalHref\(data\)/);
assert.match(controls, /appState\.currentSeriesData\?\.virtual/);
assert.match(controls, /hideControlsArea\(\)/);
assert.match(controls, /governance\/create-controls\.js/);
assert.match(controls, /governance\/series-controls\.js/);

const sourcePaths = [
	'geelooy/heichelos/heichel/modules/chitas/constants.js',
	'geelooy/heichelos/heichel/modules/chitas/date-policy.js',
	'geelooy/heichelos/heichel/modules/chitas/hebcal-provider.js',
	'geelooy/heichelos/heichel/modules/chitas/schedule.js',
	'geelooy/heichelos/heichel/modules/chitas/virtual-series.js',
	loaderPath,
	cardsPath,
	controlsPath,
	...governancePaths
];
for (const file of sourcePaths) {
	const source = read(file);
	assert.ok(source.split('\n').length - 1 <= 120, `${file} exceeds 120 lines`);
	assert.match(source, /^\/\/ B"H/);
}

console.log('B"H Daily Chitas Living Path contract passed.');
