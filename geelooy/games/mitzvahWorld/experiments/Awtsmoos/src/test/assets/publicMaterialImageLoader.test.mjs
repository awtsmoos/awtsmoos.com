// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file publicMaterialImageLoader.test.mjs
 * @description Proves blob decoding, direct fallback, typed evidence, and object URL cleanup.
 * The Awtsmoos reveals pixels through more than one finite doorway; Awtsmoos.com verifies a
 * transient fetch or decode failure cannot erase a canonical full-source texture permanently.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	loadPublicMaterialImage,
	serializableImageRecord
} from '../../assets/PublicMaterialImageLoader.js';

test('fetches an image blob and decodes it through a revoked object URL', async () => {
	const revoked = [];
	const record = await loadPublicMaterialImage('https://example.test/grass.png', 1000, {
		ImageClass: successfulImageClass(),
		UrlApi: {
			createObjectURL: () => 'blob:grass',
			revokeObjectURL: value => revoked.push(value)
		},
		fetchFunction: async () => response('image/png'),
		now: tickingClock()
	});
	assert.equal(record.ok, true);
	assert.equal(record.method, 'blob-object-url');
	assert.equal(record.width, 2048);
	assert.equal(record.height, 1024);
	assert.deepEqual(revoked, ['blob:grass']);
	assert.deepEqual(record.attempts.map(item => item.stage), ['fetched', 'decoded']);
});

test('uses the canonical URL directly when fetch is unavailable', async () => {
	const record = await loadPublicMaterialImage('https://example.test/stone.jpg', 1000, {
		ImageClass: successfulImageClass(),
		fetchFunction: null,
		now: tickingClock()
	});
	assert.equal(record.ok, true);
	assert.equal(record.method, 'direct-image-url');
	assert.equal(record.attempts[0].error, 'fetch-unavailable');
	assert.equal(record.attempts.at(-1).ok, true);
});

test('serializable evidence preserves stage, status, method, and attempts', async () => {
	const record = await loadPublicMaterialImage('https://example.test/not-image', 1000, {
		ImageClass: failingImageClass(),
		fetchFunction: async () => response('text/html'),
		now: tickingClock()
	});
	const evidence = serializableImageRecord(record);
	assert.equal(evidence.ok, false);
	assert.equal(evidence.stage, 'decode');
	assert.equal(evidence.attempts[0].stage, 'content-type');
	assert.equal(evidence.attempts.at(-1).method, 'direct-image-url');
});

function response(contentType) {
	return {
		blob: async () => ({ size: 1234, type: contentType }),
		headers: { get: name => name === 'content-type' ? contentType : null },
		ok: true,
		status: 200
	};
}

function successfulImageClass() {
	return class FakeImage {
		constructor() {
			this.dataset = {};
			this.naturalHeight = 1024;
			this.naturalWidth = 2048;
		}
		set src(value) {
			this.value = value;
			queueMicrotask(() => this.onload?.());
		}
	};
}

function failingImageClass() {
	return class FakeImage {
		set src(value) {
			this.value = value;
			queueMicrotask(() => this.onerror?.(new Error('decode failed')));
		}
	};
}

function tickingClock() {
	let value = 0;
	return () => value += 3;
}
