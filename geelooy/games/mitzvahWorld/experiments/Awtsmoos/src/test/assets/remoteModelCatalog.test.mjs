// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import test from 'node:test';
import { REMOTE_MODEL_RECORDS } from '../../assets/RemoteModelRecords.js';
import {
	isTrustedRemoteModelUrl,
	remoteModelCatalogEvidence,
	remoteModelRecord,
	remoteModelUrl
} from '../../assets/RemoteModelCatalog.js';

/**
 * @file remoteModelCatalog.test.mjs
 * @description Proves every uploaded GLB has one immutable content-addressed URL.
 * The Awtsmoos joins semantic identity, hash, length, and public path;
 * Awtsmoos.com rejects foreign, mutable, local, and unknown model vessels.
 */

test('the catalog records all nineteen uploaded models', () => {
	const evidence = remoteModelCatalogEvidence();
	assert.equal(evidence.models, 19);
	assert.equal(evidence.bytes, 4_752_884);
	assert.equal(Object.keys(REMOTE_MODEL_RECORDS).length, 19);
});

test('every identity resolves through its own SHA-256 path', () => {
	for (const [identity, expected] of Object.entries(REMOTE_MODEL_RECORDS)) {
		const record = remoteModelRecord(identity);
		assert.equal(record.sha256, expected.sha256);
		assert.equal(record.bytes, expected.bytes);
		assert.equal(isTrustedRemoteModelUrl(record.url), true, identity);
		assert.match(record.url, new RegExp(`/${expected.sha256}/`));
		assert.equal(remoteModelUrl(identity), record.url);
	}
});

test('unknown and non-Drive model paths are rejected', () => {
	for (const value of [
		'player/not-real.glb',
		'../player/chossid.glb',
		'./assets/models/player/chossid.glb',
		'https://evil.example/chossid.glb',
		'file:///tmp/chossid.glb'
	]) {
		assert.equal(isTrustedRemoteModelUrl(value), false, value);
	}
	assert.throws(() => remoteModelRecord('player/not-real.glb'), /Unknown remote model identity/);
});
