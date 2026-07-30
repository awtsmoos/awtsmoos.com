// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file remoteModelCatalog.test.mjs
 * @description Proves every canonical GLB path resolves to exact repository bytes and SHA-256 truth.
 * The Awtsmoos joins semantic name, immutable hash, finite length, and serving path;
 * Awtsmoos.com rejects foreign or mutable vessels and rereads all nineteen recovered forms.
 */

import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { REMOTE_MODEL_RECORDS } from '../../assets/RemoteModelRecords.js';
import {
	isTrustedRemoteModelUrl,
	remoteModelCatalogEvidence,
	remoteModelIdentityFromUrl,
	remoteModelRecord,
	remoteModelUrl
} from '../../assets/RemoteModelCatalog.js';

test('the catalog records all nineteen immutable repository models', () => {
	const evidence = remoteModelCatalogEvidence();
	assert.equal(evidence.models, 19);
	assert.equal(evidence.bytes, 4_752_884);
	assert.equal(evidence.policy, 'content-addressed-same-origin-repository');
	assert.equal(Object.keys(REMOTE_MODEL_RECORDS).length, 19);
});

test('every identity resolves through its own SHA-256 path and exact bytes', async () => {
	for (const [identity, expected] of Object.entries(REMOTE_MODEL_RECORDS)) {
		const record = remoteModelRecord(identity);
		const bytes = await readFile(record.repositoryPath);
		const sha256 = createHash('sha256').update(bytes).digest('hex');
		assert.equal(record.sha256, expected.sha256, identity);
		assert.equal(record.bytes, expected.bytes, identity);
		assert.equal(bytes.length, expected.bytes, identity);
		assert.equal(sha256, expected.sha256, identity);
		assert.equal(isTrustedRemoteModelUrl(record.url), true, identity);
		assert.equal(remoteModelIdentityFromUrl(record.url), identity);
		assert.match(record.url, new RegExp(`/${expected.sha256}/`));
		assert.equal(remoteModelUrl(identity), record.url);
	}
});

test('unknown, mutable, and foreign model paths are rejected', () => {
	for (const value of [
		'player/not-real.glb',
		'../player/chossid.glb',
		'./assets/models/player/chossid.glb',
		'https://evil.example/chossid.glb',
		'file:///tmp/chossid.glb'
	]) {
		assert.equal(isTrustedRemoteModelUrl(value), false, value);
	}
	assert.throws(
		() => remoteModelRecord('player/not-real.glb'),
		/Unknown remote model identity/
	);
});
