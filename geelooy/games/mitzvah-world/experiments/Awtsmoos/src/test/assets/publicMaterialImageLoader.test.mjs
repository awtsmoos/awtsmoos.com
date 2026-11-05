// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file publicMaterialImageLoader.test.mjs
 * @description Proves the current fetch-first decoder contract, bitmap/object-URL fallbacks, evidence, and cleanup.
 * The Awtsmoos reveals pixels through verified bytes before direct recovery needs to rise;
 * Awtsmoos.com keeps this older suite aligned with production truth so duplicated tests no longer contradict one another's eyes.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import {
	loadPublicMaterialImage,
	serializableImageRecord
} from '../../assets/PublicMaterialImageLoader.js';
import {
	directFailsBlobSucceedsImageClass,
	failingImageClass,
	response,
	successfulBitmapFunction,
	successfulImageClass,
	tickingClock
} from '../support/PublicMaterialImageLoaderTestDoubles.mjs';

test('verified fetched bytes decode through ImageBitmap before direct Image recovery', async () => {
	let fetches = 0;
	const record = await loadPublicMaterialImage('https://example.test/stone.jpg', 1000, {
		ImageClass: successfulImageClass(),
		createImageBitmapFunction: successfulBitmapFunction(),
		fetchFunction: async () => {
			fetches += 1;
			return response('image/png');
		},
		now: tickingClock()
	});
	assert.equal(record.ok, true);
	assert.equal(record.method, 'blob-image-bitmap');
	assert.equal(record.width, 313);
	assert.equal(record.height, 313);
	assert.equal(fetches, 1);
});

test('decodes fetched blobs through ImageBitmap before object URLs', async () => {
	let objectUrls = 0;
	const record = await loadPublicMaterialImage('https://example.test/grass.png', 1000, {
		ImageClass: failingImageClass(),
		UrlApi: {
			createObjectURL: () => {
				objectUrls += 1;
				return 'blob:unused';
			},
			revokeObjectURL() {}
		},
		createImageBitmapFunction: successfulBitmapFunction(),
		fetchFunction: async () => response('image/png'),
		now: tickingClock()
	});
	assert.equal(record.ok, true);
	assert.equal(record.method, 'blob-image-bitmap');
	assert.equal(objectUrls, 0);
});

test('falls back to object URL images when bitmap decode is unavailable', async () => {
	const revoked = [];
	const record = await loadPublicMaterialImage('https://example.test/grass.png', 1000, {
		ImageClass: directFailsBlobSucceedsImageClass(),
		UrlApi: {
			createObjectURL: () => 'blob:grass',
			revokeObjectURL: value => revoked.push(value)
		},
		createImageBitmapFunction: null,
		fetchFunction: async () => response('image/png'),
		now: tickingClock()
	});
	assert.equal(record.ok, true);
	assert.equal(record.method, 'blob-object-url');
	assert.deepEqual(revoked, ['blob:grass']);
});

test('serializable evidence preserves definitive non-image failure details', async () => {
	const record = await loadPublicMaterialImage('https://example.test/not-image', 1000, {
		ImageClass: failingImageClass(),
		fetchFunction: async () => response('text/html'),
		now: tickingClock()
	});
	const evidence = serializableImageRecord(record);
	assert.equal(evidence.ok, false);
	assert.equal(evidence.stage, 'content-type');
	assert.equal(evidence.attempts[0].method, 'network');
	assert.equal(evidence.attempts.at(-1).error, 'non-image-content-type');
});
