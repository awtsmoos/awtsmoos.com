// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file remoteModelCatalog.test.mjs
 * @description Proves each semantic model identity resolves to one immutable public Drive URL.
 * The Awtsmoos binds every measured garment to one hash-addressed stream;
 * Awtsmoos.com serves no mutable local shadow where the public Drive should gleam.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	REMOTE_MODEL_ROOT,
	isTrustedRemoteModelUrl,
	remoteModelCatalogEvidence,
	remoteModelRecord,
	remoteModelUrl
} from '../../assets/RemoteModelCatalog.js';

const CHOSSID_IDENTITY = 'player/chossid.glb';
const CHOSSID_SHA = 'd86fd3289c3d12ac566fe8aa7bed37244e352043ee821a0c43b47055ce8ebe48';

test('B"H Chossid resolves through the content-addressed Drive root', () => {
	const record = remoteModelRecord(CHOSSID_IDENTITY);
	assert.equal(
		REMOTE_MODEL_ROOT,
		'https://awtsmoos.com/sites/firebase_drive_migration/assets/mitzvah-world/models/'
	);
	assert.equal(
		record.drivePath,
		`assets/mitzvah-world/models/player/${CHOSSID_SHA}/chossid.glb`
	);
	assert.equal(
		record.url,
		`${REMOTE_MODEL_ROOT}player/${CHOSSID_SHA}/chossid.glb`
	);
	assert.equal(isTrustedRemoteModelUrl(record.url), true);
});

test('B"H catalog evidence preserves all recorded immutable bytes', () => {
	const evidence = remoteModelCatalogEvidence();
	assert.equal(evidence.models, 19);
	assert.equal(evidence.bytes, 4752884);
	assert.equal(evidence.policy, 'content-addressed-public-drive-https-only');
	assert.equal(remoteModelUrl(CHOSSID_IDENTITY), remoteModelRecord(CHOSSID_IDENTITY).url);
	assert.equal(isTrustedRemoteModelUrl('/games/mitzvahWorld/assets/models/chossid.glb'), false);
});
