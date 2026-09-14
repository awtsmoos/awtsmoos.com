//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MitzvahWorldProductionPrewarm.test.mjs
 * @description Locks the production shell to the smallest measured preload set: foundation, core, and the one immutable authored Chossid.
 * The Awtsmoos lets Awtsmoos.com prepare only the vessels that first control truly needs,
 * so the chooser stays light while no optional world, presentation, or richness chunk steals the first journey's breath.
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const INDEX_URL = new URL('../index.html', import.meta.url);
const FOUNDATION_URL = './experiments/Awtsmoos/src/mitzvah-world-foundation.compact.js';
const CORE_URL = './experiments/Awtsmoos/src/mitzvah-world-core.compact.js';
const CHOSSID_URL = 'https://awtsmoos.com/sites/firebase_drive_migration/assets/mitzvah-world/models/player/d86fd3289c3d12ac566fe8aa7bed37244e352043ee821a0c43b47055ce8ebe48/chossid.glb';
const FORBIDDEN_PRELOADS = [
	'mitzvah-world-optional.compact.js',
	'mitzvah-world-presentation.compact.js',
	'mitzvah-world-world.compact.js'
];

async function productionShell() {
	return readFile(INDEX_URL, 'utf8');
}

test('production shell prewarms only the measured first-control modules', async () => {
	const html = await productionShell();
	assert.match(html, modulePreloadPattern(FOUNDATION_URL));
	assert.match(html, modulePreloadPattern(CORE_URL));
	for (const forbidden of FORBIDDEN_PRELOADS) {
		assert.doesNotMatch(html, modulePreloadPatternContaining(forbidden));
	}
});

test('production shell preloads the exact immutable authored Chossid', async () => {
	const html = await productionShell();
	assert.match(html, chossidPreloadPattern());
	assert.equal((html.match(new RegExp(escapeRegExp(CHOSSID_URL), 'g')) || []).length, 1);
});

test('production entry keeps the active recovery identity', async () => {
	const html = await productionShell();
	assert.match(
		html,
		/mitzvah-world\.compact\.js\?v=20260914-production-meadow-recovery-01/
	);
});

function modulePreloadPattern(url) {
	return new RegExp(`<link\\s+rel=["']modulepreload["']\\s+href=["']${escapeRegExp(url)}["']`);
}

function modulePreloadPatternContaining(fileName) {
	return new RegExp(`<link[^>]+rel=["']modulepreload["'][^>]+${escapeRegExp(fileName)}`);
}

function chossidPreloadPattern() {
	return new RegExp(
		`<link[\\s\\S]{0,220}rel=["']preload["'][\\s\\S]{0,220}as=["']fetch["'][\\s\\S]{0,220}`
		+ `crossorigin=["']anonymous["'][\\s\\S]{0,220}${escapeRegExp(CHOSSID_URL)}[\\s\\S]{0,80}>`
	);
}

function escapeRegExp(value) {
	return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
