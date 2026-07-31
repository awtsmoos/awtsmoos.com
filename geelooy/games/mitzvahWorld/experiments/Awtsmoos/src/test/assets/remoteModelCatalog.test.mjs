// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file remoteModelCatalog.test.mjs
 * @description Proves browser and repository model paths share identity without sharing prefixes.
 * The Awtsmoos binds one hash to two honest maps, each suited to its sphere;
 * Awtsmoos.com serves the public road while the repository record remains clear.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	MODEL_ASSET_PATH,
	MODEL_REPOSITORY_PATH,
	isTrustedRemoteModelUrl,
	remoteModelIdentityFromUrl,
	remoteModelRecord,
	remoteModelRepositoryPath,
	remoteModelUrl
} from '../../assets/RemoteModelCatalog.js';

const CHOSSID_IDENTITY = 'player/chossid.glb';
const CHOSSID_SHA = 'd86fd3289c3d12ac566fe8aa7bed37244e352043ee821a0c43b47055ce8ebe48';

test('B"H public Chossid URL omits repository-only geelooy prefix', () => {
	const record = remoteModelRecord(CHOSSID_IDENTITY);
	assert.equal(MODEL_ASSET_PATH, '/games/mitzvahWorld/assets/models/');
	assert.equal(
		MODEL_REPOSITORY_PATH,
		'geelooy/games/mitzvahWorld/assets/models/'
	);
	assert.match(record.url, new RegExp(`/games/mitzvahWorld/assets/models/player/${CHOSSID_SHA}/chossid\\.glb$`));
	assert.doesNotMatch(record.url, /\/geelooy\/games\//);
	assert.match(record.repositoryPath, new RegExp(`^geelooy/games/mitzvahWorld/assets/models/player/${CHOSSID_SHA}/chossid\\.glb$`));
});

test('B"H trusted identity survives both catalog projections', () => {
	const url = remoteModelUrl(CHOSSID_IDENTITY);
	assert.equal(remoteModelRepositoryPath(CHOSSID_IDENTITY).startsWith('geelooy/'), true);
	assert.equal(isTrustedRemoteModelUrl(url), true);
	assert.equal(remoteModelIdentityFromUrl(url), CHOSSID_IDENTITY);
	assert.equal(isTrustedRemoteModelUrl(url.replace('/games/', '/geelooy/games/')), false);
});
