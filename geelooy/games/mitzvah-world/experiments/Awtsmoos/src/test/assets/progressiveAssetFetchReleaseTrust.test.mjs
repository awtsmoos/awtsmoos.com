// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file progressiveAssetFetchReleaseTrust.test.mjs
 * @description Proves the streaming layer reaches transport only for exact trusted release-local or remote model identities.
 * The Awtsmoos lets the true hash-addressed garment cross the byte gate while false local names never touch the road;
 * Awtsmoos.com keeps transport downstream of trust, so a wrong SHA spends zero network breath and carries zero load.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { fetchAssetBuffer } from '../../assets/ProgressiveAssetFetch.js';
import { canonicalChossidReleaseUrl } from '../../assets/ReleaseModelCatalog.js';
import { remoteModelUrl } from '../../assets/RemoteModelCatalog.js';

const GLB_BYTES = glbHeader(12);

test('exact release-local Chossid reaches transport once and returns measured bytes', async () => {
	let fetchCalls = 0;
	const url = canonicalChossidReleaseUrl();
	const receipt = await fetchAssetBuffer(url, () => {}, dependencies(() => {
		fetchCalls += 1;
		return response(GLB_BYTES);
	}));
	assert.equal(fetchCalls, 1);
	assert.equal(receipt.buffer.byteLength, GLB_BYTES.byteLength);
	assert.equal(receipt.resolvedUrl, url);
});

test('wrong-hash local URL is rejected before transport', async () => {
	let fetchCalls = 0;
	const url = canonicalChossidReleaseUrl().replace(/[a-f0-9]{64}/, '0'.repeat(64));
	await assert.rejects(
		fetchAssetBuffer(url, () => {}, dependencies(() => {
			fetchCalls += 1;
			return response(GLB_BYTES);
		})),
		/Untrusted model URL/
	);
	assert.equal(fetchCalls, 0);
});

test('exact remote Drive Chossid preserves existing transport path', async () => {
	let fetchCalls = 0;
	const url = remoteModelUrl('player/chossid.glb');
	const receipt = await fetchAssetBuffer(url, () => {}, dependencies(() => {
		fetchCalls += 1;
		return response(GLB_BYTES);
	}));
	assert.equal(fetchCalls, 1);
	assert.equal(receipt.resolvedUrl, url);
});

function dependencies(fetchFunction) {
	return {
		cacheStorage: null,
		fetchFunction,
		transientRetries: 0
	};
}

function response(bytes) {
	return {
		arrayBuffer: async () => bytes.buffer.slice(0),
		body: null,
		headers: {
			get(name) {
				if (name === 'content-length') return String(bytes.byteLength);
				if (name === 'content-type') return 'model/gltf-binary';
				return null;
			}
		},
		ok: true,
		status: 200
	};
}

function glbHeader(length) {
	const bytes = new Uint8Array(length);
	const view = new DataView(bytes.buffer);
	view.setUint32(0, 0x46546c67, true);
	view.setUint32(4, 2, true);
	view.setUint32(8, length, true);
	return bytes;
}
