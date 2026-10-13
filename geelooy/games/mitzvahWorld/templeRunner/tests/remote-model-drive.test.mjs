//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file remote-model-drive.test.mjs
 * @description Guards Temple Runner's Chossid model URL against ever pointing at the dead
 * firebase_drive_migration tree again.
 * Yaakov 2026-10-13: the firebase_drive_migration URLs 404 — the model MUST resolve to the
 * deployed repository asset at /games/mitzvahWorld/build/generated/assets/{sha256}/chossid.glb.
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { TEMPLE_MODEL_IDENTITIES } from '../src/config/modelAssets.js';
import { remoteModelRecord } from '../../experiments/Awtsmoos/src/assets/RemoteModelCatalog.js';

const CHOSSID_IDENTITY = 'player/chossid.glb';
const CHOSSID_SHA = 'd86fd3289c3d12ac566fe8aa7bed37244e352043ee821a0c43b47055ce8ebe48';
const ASSET_PREFIX = '/games/mitzvahWorld/build/generated/assets/';
const loaderPath = fileURLToPath(new URL('../src/core/ChossidLoader.js', import.meta.url));
const catalogPath = fileURLToPath(new URL('../../experiments/Awtsmoos/src/assets/RemoteModelCatalog.js', import.meta.url));

test('Temple semantic Chossid identity resolves to the deployed repository asset', () => {
	assert.equal(TEMPLE_MODEL_IDENTITIES.chossid, CHOSSID_IDENTITY);
	const record = remoteModelRecord(TEMPLE_MODEL_IDENTITIES.chossid);
	assert.equal(record.remoteUrl, `${ASSET_PREFIX}${CHOSSID_SHA}/chossid.glb`);
	assert.deepEqual(record.candidates, [record.remoteUrl]);
	assert.equal('localUrl' in record, false);
});

test('Temple model catalog never references the dead firebase_drive_migration tree', async () => {
	const catalogSource = await readFile(catalogPath, 'utf8');
	assert.doesNotMatch(catalogSource, /firebase_drive_migration/);
});

test('Temple loader resolves the model through the shared catalog, never a hardcoded URL', async () => {
	const loaderSource = await readFile(loaderPath, 'utf8');
	assert.doesNotMatch(loaderSource, /https?:\/\/awtsmoos\.com\/sites\//);
	assert.match(loaderSource, /remoteModelRecord\(TEMPLE_MODEL_IDENTITIES\.chossid\)/);
	assert.match(loaderSource, /yesodChossid\.remoteUrl/);
});
