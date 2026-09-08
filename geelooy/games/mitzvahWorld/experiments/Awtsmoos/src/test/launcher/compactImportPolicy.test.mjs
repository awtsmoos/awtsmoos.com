// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file compactImportPolicy.test.mjs
 * @description Guards compact Dynamic Server doors while allowing optional mode aftercare to live beyond the playable boundary.
 * The Awtsmoos lets many local modules become one browser river; Awtsmoos.com keeps first play narrow while every later doorway
 * remains explicit, compact-processed, and discoverable in the owner that actually opens it.
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const SOURCE_ROOT = fileURLToPath(new URL('../../', import.meta.url));
const TARGETS = Object.freeze({
	aftercare: 'launcher/MitzvahWorldModeAftercare.js',
	creativeRoute: 'launcher/MitzvahWorldCreativeRouteLoader.js',
	direct: 'launcher/MitzvahWorldDirectExperience.js',
	mode: 'launcher/MitzvahWorldModeLoaders.js',
	postPlay: 'launcher/MitzvahWorldPostPlayExperience.js',
	presentation: 'launcher/MitzvahWorldGameplayPresentation.js',
	rich: 'app/MinimalMeadowWorldRichSchedule.js'
});

const REQUIRED_DOORS = Object.freeze({
	aftercare: [
		'MultiplayerStatusBadge.js?compact=true',
		'MitzvahWorldPostPlayPolicy.js?compact=true&v=',
		'MitzvahWorldPostPlayLoader.js?compact=true&v='
	],
	creativeRoute: [
		'MitzvahWorldCreativeModeLoaders.js?compact=true&v=',
		'MitzvahWorldDirectExperience.js?compact=true&v='
	],
	direct: [
		'MitzvahWorldGameplayPresentation.js?compact=true&v=',
		'MinimalMeadowDirectWorldAudio.js?compact=true&v='
	],
	mode: [
		'createEretzRuntime.js?compact=true&v=',
		'MitzvahWorldCreativeRouteLoader.js?compact=true&v=',
		'MitzvahWorldSinglePlayerRuntimeOptions.js?compact=true&v=',
		'MultiplayerEretzRuntime.js?compact=true&v='
	],
	postPlay: ['MitzvahWorldDirectExperience.js?compact=true&v='],
	presentation: [
		'HudMinimizeController.js?compact=true',
		'MitzvahWorldCreativeDock.js?compact=true&v='
	],
	rich: ['MinimalMeadowRichWorld.js?compact=true']
});

test('every independently requested raw MitzvahWorld entry uses compact server processing', async () => {
	for (const [key, relativePath] of Object.entries(TARGETS)) {
		const source = await readSource(relativePath);
		for (const doorway of REQUIRED_DOORS[key]) {
			assert.equal(source.includes(doorway), true, `${relativePath} missing ${doorway}`);
		}
	}
});

test('creative and aftercare capability stay behind their dedicated dynamic owners', async () => {
	const modeSource = await readSource(TARGETS.mode);
	const creativeSource = await readSource(TARGETS.creativeRoute);
	const aftercareSource = await readSource(TARGETS.aftercare);
	assert.match(modeSource, /MitzvahWorldCreativeRouteLoader\.js\?compact=true/);
	assert.match(modeSource, /MitzvahWorldModeAftercare\.js\?compact=true/);
	assert.doesNotMatch(modeSource, /MultiplayerStatusBadge\.js/);
	assert.doesNotMatch(modeSource, /MitzvahWorldCreativeModeLoaders\.js\?compact=true/);
	assert.match(creativeSource, /MitzvahWorldCreativeModeLoaders\.js\?compact=true&v=/);
	assert.match(aftercareSource, /MultiplayerStatusBadge\.js\?compact=true/);
});

test('versioned raw local entries use compact before the cache version key', async () => {
	const source = await allTargetSource();
	assert.doesNotMatch(source, /\.js\?v=[^'"`\s]+&compact=true/);
	assert.match(source, /\.js\?compact=true&v=/);
});

test('compact policy never decorates generated compact artifacts or public vendor ESM', async () => {
	const source = await allTargetSource();
	assert.doesNotMatch(source, /\.compact\.js\?[^'"`\s]*compact=true/);
	assert.doesNotMatch(source, /\/(?:games\/)?scripts\/build\/[^'"`\s]*compact=true/);
});

async function allTargetSource() {
	const sources = await Promise.all(Object.values(TARGETS).map(readSource));
	return sources.join('\n');
}

async function readSource(relativePath) {
	return readFile(`${SOURCE_ROOT}${relativePath}`, 'utf8');
}
