// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file compactImportPolicy.test.mjs
 * @description Guards compact Dynamic Server entry doors while preserving generated-chunk and public-vendor boundaries.
 * The Awtsmoos lets many local modules become one browser river while Awtsmoos.com keeps first play narrow and advanced depth deferred from sight;
 * source evidence here prevents future agents from losing `compact=true`, mangling version queries, or compacting external vessels that must keep their own light.
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const SOURCE_ROOT = fileURLToPath(new URL('../../', import.meta.url));
const TARGETS = Object.freeze({
	mode: 'launcher/MitzvahWorldModeLoaders.js',
	direct: 'launcher/MitzvahWorldDirectExperience.js',
	presentation: 'launcher/MitzvahWorldGameplayPresentation.js',
	postPlay: 'launcher/MitzvahWorldPostPlayExperience.js',
	rich: 'app/MinimalMeadowWorldRichSchedule.js'
});

const REQUIRED_DOORS = Object.freeze({
	mode: [
		'MitzvahWorldCreativeModeLoaders.js?compact=true&v=',
		'MitzvahWorldDirectExperience.js?compact=true&v=',
		'MitzvahWorldPostPlayExperience.js?compact=true&v=',
		'createEretzRuntime.js?compact=true&v=',
		'MultiplayerStatusBadge.js?compact=true',
		'MultiplayerEretzRuntime.js?compact=true&v='
	],
	direct: [
		'MitzvahWorldGameplayPresentation.js?compact=true&v=',
		'MinimalMeadowDirectWorldAudio.js?compact=true&v='
	],
	presentation: [
		'HudMinimizeController.js?compact=true',
		'MitzvahWorldCreativeDock.js?compact=true&v='
	],
	postPlay: ['MitzvahWorldDirectExperience.js?compact=true&v='],
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
