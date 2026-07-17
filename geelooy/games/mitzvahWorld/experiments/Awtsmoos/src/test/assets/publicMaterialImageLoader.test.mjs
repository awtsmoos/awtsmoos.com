// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file publicMaterialImageLoader.test.mjs
 * @description Proves direct-first decoding, blob fallback, typed evidence, and cleanup.
 * The Awtsmoos reveals cottage pixels through the fastest truthful doorway; Awtsmoos.com
 * verifies fetch latency cannot delay visible stone while robust fallback remains available.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	loadPublicMaterialImage,
	serializableImageRecord
} from '../../assets/PublicMaterialImageLoader.js';

test('decodes the canonical URL directly before attempting a fetch', async () => {
	let fetches = 0;
	const record = await loadPublicMaterialImage('https://example.test/stone.jpg', 1000, {
		ImageClass: successfulImageClass(),
		fetchFunction: async () => {
			fetches += 1;
			return response('image/png');
		},
		now: tickingClock()
	});
	assert.equal(record.ok, true);
	assert.equal(record.method, 'direct-image-url');
	assert.equal(record.width, 2048);
	assert.equal(record.height, 1024);
	assert.equal(fetches, 0);
	assert.deepEqual(record.attempts.map(item => item.stage), ['decoded']);
});

test('falls back to fetched blob decoding and revokes its object URL', async () => {
	const revoked = [];
	const record = await loadPublicMaterialImage('https://example.test/grass.png', 1000, {
		ImageClass: directFailsBlobSucceedsImageClass(),
		UrlApi: {
			createObjectURL: () => 'blob:grass',
			revokeObjectURL: value => revoked.push(value)
		},
		fetchFunction: async () => response('image/png'),
		now: tickingClock()
	});
	assert.equal(record.ok, true);
	assert.equal(record.method, 'blob-object-url');
	assert.deepEqual(revoked, ['blob:grass']);
	assert.deepEqual(record.attempts.map(item => item.stage), [
		'decode',
		'fetched',
		'decoded'
	]);
});

test('serializable evidence preserves stage, status, method, and attempts', async () => {
	const record = await loadPublicMaterialImage('https://example.test/not-image', 1000, {
		ImageClass: failingImageClass(),
		fetchFunction: async () => response('text/html'),
		now: tickingClock()
	});
	const evidence = serializableImageRecord(record);
	assert.equal(evidence.ok, false);
	assert.equal(evidence.stage, 'content-type');
	assert.equal(evidence.attempts[0].method, 'direct-image-url');
	assert.equal(evidence.attempts.at(-1).error, 'non-image-content-type');
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

function directFailsBlobSucceedsImageClass() {
	return class FakeImage {
		constructor() {
			this.dataset = {};
			this.naturalHeight = 1024;
			this.naturalWidth = 2048;
		}
		set src(value) {
			this.value = value;
			queueMicrotask(() => value.startsWith('blob:') ? this.onload?.() : this.onerror?.());
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
