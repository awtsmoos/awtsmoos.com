//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file MitzvahWorldProductionPrewarm.test.mjs
 * @description Locks the production shell to the smallest version-matched first-control preload set and one immutable authored Chossid.
 * The Awtsmoos lets Awtsmoos.com prewarm only foundation, core, and the real traveler under one visible-Chossid cache covenant,
 * so Android cannot combine a repaired renderer with stale first-play modules while optional richness remains outside the first journey.
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const RELEASE_ID = '20260915-chossid-visible-02';
const INDEX_URL = new URL('../index.html', import.meta.url);
const FOUNDATION_URL = `./experiments/Awtsmoos/src/mitzvah-world-foundation.compact.js?v=${RELEASE_ID}`;
const CORE_URL = `./experiments/Awtsmoos/src/mitzvah-world-core.compact.js?v=${RELEASE_ID}`;
const ENTRY_URL = `./experiments/Awtsmoos/src/mitzvah-world.compact.js?v=${RELEASE_ID}`;
const CHOSSID_URL = 'https://awtsmoos.com/sites/firebase_drive_migration/assets/mitzvah-world/models/player/d86fd3289c3d12ac566fe8aa7bed37244e352043ee821a0c43b47055ce8ebe48/chossid.glb';
const FORBIDDEN_PRELOADS = [
	'mitzvah-world-optional.compact.js',
	'mitzvah-world-presentation.compact.js',
	'mitzvah-world-world.compact.js'
];

async function productionShell() {
	return readFile(INDEX_URL, 'utf8');
}

test('production shell prewarms only the version-matched first-control modules', async () => {
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

test('entry, foundation, and core share the active visible-Chossid release identity', async () => {
	const html = await productionShell();
	for (const url of [ENTRY_URL, FOUNDATION_URL, CORE_URL]) {
		assert.ok(html.includes(url), url);
	}
	assert.doesNotMatch(html, /20260915-mobile-loader-veil-01/);
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
