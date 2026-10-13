//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MitzvahWorldProductionPrewarm.test.mjs
 * @description Locks production to version-matched first-control modules and the release-owned immutable Chossid for the playable meadow.
 * The Awtsmoos lets Awtsmoos.com prewarm foundation, core, and the real traveler beneath one present release decree,
 * while renderer promotion and decorative hydration remain after first play so the grounded meadow may arrive swiftly and truthfully.
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const HASH_VERSION = '[0-9a-f]{10}';
const INDEX_URL = new URL('../index.html', import.meta.url);
const FOUNDATION_FILE = './experiments/Awtsmoos/src/mitzvah-world-foundation.compact.js';
const PLAYER_FILE = './experiments/Awtsmoos/src/mitzvah-world-player.compact.js';
const CORE_FILE = './experiments/Awtsmoos/src/mitzvah-world-core.compact.js';
const ENTRY_FILE = './experiments/Awtsmoos/src/mitzvah-world.compact.js';
const CHOSSID_URL = './build/generated/assets/d86fd3289c3d12ac566fe8aa7bed37244e352043ee821a0c43b47055ce8ebe48/chossid.glb';
const FORBIDDEN_PRELOADS = [
	'mitzvah-world-optional.compact.js',
	'mitzvah-world-presentation.compact.js',
	'mitzvah-world-world.compact.js'
];
const RETIRED_RELEASE_IDS = [
	'20260928-playable-meadow-01',
	'20260915-authored-meadow-03'
];

async function productionShell() {
	return readFile(INDEX_URL, 'utf8');
}

test('production shell prewarms only version-matched first-control modules', async () => {
	const html = await productionShell();
	for (const file of [FOUNDATION_FILE, PLAYER_FILE, CORE_FILE]) {
		assert.match(html, modulePreloadPattern(file), file);
	}
	for (const forbidden of FORBIDDEN_PRELOADS) {
		assert.doesNotMatch(html, modulePreloadPatternContaining(forbidden));
	}
});

test('production shell preloads the exact release-owned authored Chossid', async () => {
	const html = await productionShell();
	assert.match(html, chossidPreloadPattern());
	assert.equal((html.match(new RegExp(escapeRegExp(CHOSSID_URL), 'g')) || []).length, 1);
});

test('entry, foundation, player, and core carry content-hash cache busters', async () => {
	const html = await productionShell();
	for (const file of [ENTRY_FILE, FOUNDATION_FILE, PLAYER_FILE, CORE_FILE]) {
		assert.match(html, versionedModulePattern(file), file);
	}
	for (const retired of RETIRED_RELEASE_IDS) {
		assert.doesNotMatch(html, new RegExp(escapeRegExp(retired)), retired);
	}
});

function versionedModulePattern(file) {
	return new RegExp(`${escapeRegExp(file)}\\?v=${HASH_VERSION}`);
}

function modulePreloadPattern(file) {
	return new RegExp(`<link\\s+rel=["']modulepreload["']\\s+href=["']${escapeRegExp(file)}\\?v=${HASH_VERSION}["']`);
}

function modulePreloadPatternContaining(fileName) {
	return new RegExp(`<link[^>]+rel=["']modulepreload["'][^>]+${escapeRegExp(fileName)}`);
}

function chossidPreloadPattern() {
	return new RegExp(
		`<link[\\s\\S]{0,220}rel=["']preload["'][\\s\\S]{0,220}as=["']fetch["'][\\s\\S]{0,220}`
		+ `${escapeRegExp(CHOSSID_URL)}[\\s\\S]{0,80}>`
	);
}

function escapeRegExp(value) {
	return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
