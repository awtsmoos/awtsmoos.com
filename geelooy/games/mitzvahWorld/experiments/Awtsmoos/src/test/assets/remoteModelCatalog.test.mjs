// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file remoteModelCatalog.test.mjs
 * @description Proves each model uses exact same-origin bytes before its immutable remote mirror.
 * The Awtsmoos binds path and hash in a nearby vessel; Awtsmoos.com retains distant mercy.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	LOCAL_MODEL_ROOT,
	REMOTE_MODEL_ROOT,
	isTrustedModelUrl,
	modelUrlCandidates,
	remoteModelCatalogEvidence,
	remoteModelRecord,
	remoteModelUrl
} from '../../assets/RemoteModelCatalog.js';

const IDENTITY = 'player/chossid.glb';
const SHA = 'd86fd3289c3d12ac566fe8aa7bed37244e352043ee821a0c43b47055ce8ebe48';

test('B"H Chossid resolves to the content-addressed same-origin route first', () => {
	const record = remoteModelRecord(IDENTITY);
	assert.equal(record.url, `${LOCAL_MODEL_ROOT}player/${SHA}/chossid.glb`);
	assert.equal(record.remoteUrl, `${REMOTE_MODEL_ROOT}player/${SHA}/chossid.glb`);
	assert.deepEqual(modelUrlCandidates(record.url), [record.localUrl, record.remoteUrl]);
	assert.equal(isTrustedModelUrl(record.localUrl), true);
	assert.equal(isTrustedModelUrl(record.remoteUrl), true);
});

test('B"H catalog evidence preserves immutable bytes and rejects mutation', () => {
	const evidence = remoteModelCatalogEvidence();
	assert.equal(evidence.models, 19);
	assert.equal(evidence.bytes, 4752884);
	assert.equal(evidence.policy, 'content-addressed-same-origin-first-remote-fallback');
	assert.equal(remoteModelUrl(IDENTITY), remoteModelRecord(IDENTITY).localUrl);
	assert.equal(isTrustedModelUrl(`${remoteModelUrl(IDENTITY)}?mutable=1`), false);
	assert.equal(isTrustedModelUrl('/games/mitzvahWorld/assets/models/chossid.glb'), false);
});
