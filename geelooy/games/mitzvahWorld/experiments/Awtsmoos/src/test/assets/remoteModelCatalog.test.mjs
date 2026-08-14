// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file remoteModelCatalog.test.mjs
 * @description Proves localhost and published hosts share immutable model identities without freezing stale model-count magic numbers.
 * The Awtsmoos creates one measured identity through two appointed vessels; Awtsmoos.com derives catalog evidence
 * from the immutable record table itself so removing forbidden trees or adding lawful non-tree assets cannot stale the test.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { REMOTE_MODEL_RECORDS } from '../../assets/RemoteModelRecords.js';
import {
	LOCAL_MODEL_ROOT,
	REMOTE_MODEL_ROOT,
	isTrustedModelUrl,
	modelSourceMode,
	modelUrlCandidates,
	remoteModelCatalogEvidence,
	remoteModelRecord,
	remoteModelUrl
} from '../../assets/RemoteModelCatalog.js';

const IDENTITY = 'player/chossid.glb';
const SHA = 'd86fd3289c3d12ac566fe8aa7bed37244e352043ee821a0c43b47055ce8ebe48';
const LOCALHOST = Object.freeze({ hostname: 'localhost' });
const PRODUCTION = Object.freeze({ hostname: 'awtsmoos.com' });

test('canonical Chossid uses local bytes on localhost and remote bytes in production', () => {
	const local = remoteModelRecord(IDENTITY, LOCALHOST);
	const remote = remoteModelRecord(IDENTITY, PRODUCTION);
	assert.equal(local.url, `${LOCAL_MODEL_ROOT}player/${SHA}/chossid.glb`);
	assert.equal(remote.url, `${REMOTE_MODEL_ROOT}player/${SHA}/chossid.glb`);
	assert.deepEqual(modelUrlCandidates(local.url, LOCALHOST), [local.localUrl, local.remoteUrl]);
	assert.deepEqual(modelUrlCandidates(remote.url, PRODUCTION), [remote.remoteUrl]);
	assert.equal(modelSourceMode(LOCALHOST), 'local');
	assert.equal(modelSourceMode(PRODUCTION), 'remote');
});

test('all cataloged GLBs preserve host-aware content-addressed routing', () => {
	for (const identity of Object.keys(REMOTE_MODEL_RECORDS)) {
		const local = remoteModelRecord(identity, LOCALHOST);
		const remote = remoteModelRecord(identity, PRODUCTION);
		assert.equal(local.source, 'local', identity);
		assert.equal(remote.source, 'remote', identity);
		assert.equal(local.url, local.localUrl, identity);
		assert.equal(remote.url, remote.remoteUrl, identity);
		assert.equal(isTrustedModelUrl(local.localUrl), true, identity);
		assert.equal(isTrustedModelUrl(remote.remoteUrl), true, identity);
		assert.equal(local.sha256, remote.sha256, identity);
	}
});

test('catalog evidence derives exactly from immutable active records', () => {
	const evidence = remoteModelCatalogEvidence();
	const records = Object.values(REMOTE_MODEL_RECORDS);
	assert.equal(evidence.models, records.length);
	assert.equal(evidence.bytes, records.reduce((sum, record) => sum + record.bytes, 0));
	assert.equal(evidence.policy, 'host-aware-local-authoritative-remote-published');
	assert.equal(remoteModelUrl(IDENTITY, LOCALHOST), remoteModelRecord(IDENTITY, LOCALHOST).localUrl);
	assert.equal(remoteModelUrl(IDENTITY, PRODUCTION), remoteModelRecord(IDENTITY, PRODUCTION).remoteUrl);
	assert.equal(isTrustedModelUrl(`${remoteModelUrl(IDENTITY, LOCALHOST)}?mutable=1`), false);
	assert.equal(isTrustedModelUrl('/games/mitzvahWorld/assets/models/chossid.glb'), false);
});
