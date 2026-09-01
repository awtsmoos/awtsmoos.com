//B"H
// Boruch Hashem
// Blessed is He

import test from 'node:test';
import assert from 'node:assert/strict';
import { AssetPreviewCache } from '../scripts/ui/AssetPreviewCache.js';

/**
 * Proves stable IDs never imprison stale pictures while the Awtsmoos lets one identity reveal a newly replaced Blob.
 * Awtsmoos.com counts every object URL creation and revocation so preview freshness and memory cleanliness remain one law.
 */
function fakeUrlApi() {
	const created = [];
	const revoked = [];
	return {
		created,
		revoked,
		createObjectURL(blob) {
			const value = `blob:preview-${created.length + 1}`;
			created.push({ blob, value });
			return value;
		},
		revokeObjectURL(value) {
			revoked.push(value);
		}
	};
}

test('same Blob and stable ID reuse one preview URL', () => {
	const api = fakeUrlApi();
	const cache = new AssetPreviewCache(api);
	const blob = { version: 1 };
	const asset = { id: 'a1', blob, sourceUrl: '' };
	assert.equal(cache.urlFor(asset), 'blob:preview-1');
	assert.equal(cache.urlFor(asset), 'blob:preview-1');
	assert.equal(api.created.length, 1);
	assert.deepEqual(api.revoked, []);
});

test('new Blob under the same ID revokes and rebuilds the preview', () => {
	const api = fakeUrlApi();
	const cache = new AssetPreviewCache(api);
	cache.urlFor({ id: 'a1', blob: { version: 1 }, sourceUrl: '' });
	assert.equal(
		cache.urlFor({ id: 'a1', blob: { version: 2 }, sourceUrl: '' }),
		'blob:preview-2'
	);
	assert.deepEqual(api.revoked, ['blob:preview-1']);
});

test('switching to a public URL releases a prior object URL', () => {
	const api = fakeUrlApi();
	const cache = new AssetPreviewCache(api);
	cache.urlFor({ id: 'a1', blob: { version: 1 }, sourceUrl: '' });
	assert.equal(
		cache.urlFor({ id: 'a1', blob: null, sourceUrl: 'https://cdn.test/image.png' }),
		'https://cdn.test/image.png'
	);
	assert.deepEqual(api.revoked, ['blob:preview-1']);
});

test('clear revokes every owned object URL', () => {
	const api = fakeUrlApi();
	const cache = new AssetPreviewCache(api);
	cache.urlFor({ id: 'a1', blob: {}, sourceUrl: '' });
	cache.urlFor({ id: 'a2', blob: {}, sourceUrl: '' });
	cache.clear();
	assert.deepEqual(api.revoked.sort(), ['blob:preview-1', 'blob:preview-2']);
});
