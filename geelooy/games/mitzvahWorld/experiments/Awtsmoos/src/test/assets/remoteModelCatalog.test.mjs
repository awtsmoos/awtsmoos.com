//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file remoteModelCatalog.test.mjs
 * @description Proves every host resolves immutable GLB identities only through Awtsmoos Drive.
 * The Awtsmoos gives one distant vessel to every measured garment, with no local shadow in disguise;
 * Awtsmoos.com keeps localhost and production beneath the same remote covenant before all testing eyes.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { REMOTE_MODEL_RECORDS } from '../../assets/RemoteModelRecords.js';
import {
	REMOTE_MODEL_ROOT,
	isTrustedModelUrl,
	modelSourceMode,
	modelUrlCandidates,
	remoteModelCatalogEvidence,
	remoteModelRecord,
	remoteModelUrl
} from '../../assets/RemoteModelCatalog.js';

const IDENTITY = 'player/chossid.glb';
const LOCALHOST = Object.freeze({ hostname: 'localhost' });
const PRODUCTION = Object.freeze({ hostname: 'awtsmoos.com' });

test('canonical Chossid uses the same immutable Drive URL on every host', () => {
	const local = remoteModelRecord(IDENTITY, LOCALHOST);
	const remote = remoteModelRecord(IDENTITY, PRODUCTION);
	assert.equal(local.remoteUrl, remote.remoteUrl);
	assert.equal(local.url, remote.url);
	assert.equal(local.url.startsWith(REMOTE_MODEL_ROOT), true);
	assert.deepEqual(modelUrlCandidates(local.url, LOCALHOST), [local.remoteUrl]);
	assert.deepEqual(modelUrlCandidates(remote.url, PRODUCTION), [remote.remoteUrl]);
	assert.equal(modelSourceMode(LOCALHOST), 'remote');
	assert.equal(modelSourceMode(PRODUCTION), 'remote');
	assert.equal('localUrl' in local, false);
});

test('every cataloged GLB is Drive-only and content-addressed', () => {
	for (const identity of Object.keys(REMOTE_MODEL_RECORDS)) {
		const local = remoteModelRecord(identity, LOCALHOST);
		const remote = remoteModelRecord(identity, PRODUCTION);
		assert.equal(local.source, 'remote', identity);
		assert.equal(remote.source, 'remote', identity);
		assert.equal(local.url, remote.remoteUrl, identity);
		assert.deepEqual(local.candidates, [remote.remoteUrl], identity);
		assert.equal(isTrustedModelUrl(remote.remoteUrl), true, identity);
		assert.equal('localUrl' in remote, false, identity);
		assert.match(remote.remoteUrl, new RegExp(`/${remote.sha256}/[^/]+$`), identity);
	}
});

test('catalog evidence declares Drive authority and rejects mutable or local paths', () => {
	const evidence = remoteModelCatalogEvidence();
	const records = Object.values(REMOTE_MODEL_RECORDS);
	assert.equal(evidence.models, records.length);
	assert.equal(evidence.bytes, records.reduce((sum, record) => sum + record.bytes, 0));
	assert.equal(evidence.policy, 'drive-authoritative-remote-only');
	assert.equal(evidence.remoteRoot, REMOTE_MODEL_ROOT);
	assert.equal(remoteModelUrl(IDENTITY, LOCALHOST), remoteModelUrl(IDENTITY, PRODUCTION));
	assert.equal(isTrustedModelUrl(`${remoteModelUrl(IDENTITY)}?mutable=1`), false);
	assert.equal(isTrustedModelUrl('/games/mitzvahWorld/assets/models/chossid.glb'), false);
	assert.equal(isTrustedModelUrl('../assets/models/player/chossid.glb'), false);
});
