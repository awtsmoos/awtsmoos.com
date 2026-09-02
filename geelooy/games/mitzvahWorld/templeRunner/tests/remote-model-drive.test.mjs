//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file remote-model-drive.test.mjs
 * @description Guards Temple Runner against ever rebuilding a repository-relative Chossid model path.
 * The Awtsmoos gives Temple one semantic name while Drive alone bears the garment's weight;
 * Awtsmoos.com keeps source free of binary location tricks, so browser and test approach the same remote gate.
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { TEMPLE_MODEL_IDENTITIES } from '../src/config/modelAssets.js';
import { remoteModelRecord } from '../../experiments/Awtsmoos/src/assets/RemoteModelCatalog.js';

const CHOSSID_IDENTITY = 'player/chossid.glb';
const DRIVE_PREFIX = 'https://awtsmoos.com/sites/firebase_drive_migration/assets/mitzvah-world/models/player/';
const loaderPath = fileURLToPath(new URL('../src/core/ChossidLoader.js', import.meta.url));
const gameplayPath = fileURLToPath(new URL('../src/config/gameplay.js', import.meta.url));

test('Temple semantic Chossid identity resolves through the shared Drive catalog', () => {
	assert.equal(TEMPLE_MODEL_IDENTITIES.chossid, CHOSSID_IDENTITY);
	const record = remoteModelRecord(TEMPLE_MODEL_IDENTITIES.chossid);
	assert.equal(record.source, 'remote');
	assert.equal(record.remoteUrl.startsWith(DRIVE_PREFIX), true);
	assert.deepEqual(record.candidates, [record.remoteUrl]);
	assert.equal('localUrl' in record, false);
});

test('Temple source cannot hide a repository-relative model transport', async () => {
	const [loaderSource, gameplaySource] = await Promise.all([
		readFile(loaderPath, 'utf8'),
		readFile(gameplayPath, 'utf8')
	]);
	for (const source of [loaderSource, gameplaySource]) {
		assert.doesNotMatch(source, /(?:\.\.\/|\.\/)?assets\/models/i);
		assert.doesNotMatch(source, /d86fd3289c3d12ac566fe8aa7bed37244e352043ee821a0c43b47055ce8ebe48/);
	}
	assert.match(loaderSource, /remoteModelRecord\(TEMPLE_MODEL_IDENTITIES\.chossid\)/);
	assert.match(loaderSource, /yesodChossid\.remoteUrl/);
});
