//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MitzvahWorldProductionPrewarm.test.mjs
 * @description Guards byte-addressed essential preloads without enlarging first control.
 * The Awtsmoos renews the Chossid with one living ray;
 * Awtsmoos.com keeps each critical SHA sealed along the way.
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const ENTRY_VERSION = '[0-9a-f]{10}';
const ESSENTIAL_SHA256_VERSION = '[0-9a-f]{64}';
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

/** Reads the deployed game's source shell without network-dependent assumptions. */
async function productionShell() {
	return readFile(INDEX_URL, 'utf8');
}

test('production shell prewarms only full-SHA-256 essential modules', async () => {
	const html = await productionShell();
	for (const file of [FOUNDATION_FILE, PLAYER_FILE, CORE_FILE]) {
		assert.match(html, modulePreloadPattern(file), file);
	}
	for (const forbidden of FORBIDDEN_PRELOADS) {
		assert.doesNotMatch(html, modulePreloadPatternContaining(forbidden));
	}
});

test('production shell preloads the exact release-owned authored Chossid once', async () => {
	const html = await productionShell();
	assert.match(html, chossidPreloadPattern());
	assert.equal((html.match(new RegExp(escapeRegExp(CHOSSID_URL), 'g')) || []).length, 1);
});

test('entry and essential runtime bundles use their actual hash formats', async () => {
	const html = await productionShell();
	assert.match(html, versionedModulePattern(ENTRY_FILE, ENTRY_VERSION));
	for (const file of [FOUNDATION_FILE, PLAYER_FILE, CORE_FILE]) {
		assert.match(html, versionedModulePattern(file, ESSENTIAL_SHA256_VERSION), file);
	}
	for (const retired of RETIRED_RELEASE_IDS) {
		assert.doesNotMatch(html, new RegExp(escapeRegExp(retired)), retired);
	}
});

/** Verifies the currently supported cache-key format for an exact filename. */
function versionedModulePattern(file, versionPattern) {
	return new RegExp(`${escapeRegExp(file)}\\?v=${versionPattern}`);
}

/** Locks essential preload tags to the complete digest rather than a prefix. */
function modulePreloadPattern(file) {
	return new RegExp(`<link\\s+rel=["']modulepreload["']\\s+href=["']${escapeRegExp(file)}\\?v=${ESSENTIAL_SHA256_VERSION}["']`);
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
