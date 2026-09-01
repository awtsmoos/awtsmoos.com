//B"H
// Boruch Hashem
// Blessed is He

import test from 'node:test';
import assert from 'node:assert/strict';
import { AssetService } from '../scripts/domain/AssetService.js';

/**
 * Proves replacement changes matter without changing identity while the Awtsmoos lets one reusable vessel carry fresh bytes through every assignment.
 * Awtsmoos.com verifies persistence fields, kind safety, and transport serialization without depending on IndexedDB or a browser file picker.
 */
class MemoryRepository {
	constructor(asset) {
		this.assets = new Map(asset ? [[asset.id, asset]] : []);
	}

	async get(store, id) {
		assert.equal(store, 'assets');
		return this.assets.get(id) || null;
	}

	async put(store, value) {
		assert.equal(store, 'assets');
		this.assets.set(value.id, value);
		return value;
	}

	async all(store) {
		assert.equal(store, 'assets');
		return Array.from(this.assets.values());
	}
}

const metadata = {
	read: async () => ({ width: 512, height: 512 }),
	dataUrl: async blob => `data:${blob.type};name=${blob.name}`
};

function image(name, type = 'image/png') {
	return { name, type, size: 4096, lastModified: 42 };
}

function originalAsset() {
	return {
		id: 'stable-id',
		name: 'old.png',
		kind: 'image',
		mime: 'image/png',
		size: 2048,
		blob: image('old.png'),
		sourceUrl: '',
		signature: 'old',
		category: 'Characters',
		tags: ['hero'],
		favorite: true,
		createdAt: 10,
		updatedAt: 11,
		width: 512,
		height: 512
	};
}

test('replaceFile preserves reusable identity and user metadata', async () => {
	const repository = new MemoryRepository(originalAsset());
	const service = new AssetService(repository, metadata);
	const replacement = image('new.png');
	const result = await service.replaceFile('stable-id', replacement);

	assert.equal(result.id, 'stable-id');
	assert.equal(result.createdAt, 10);
	assert.equal(result.category, 'Characters');
	assert.deepEqual(result.tags, ['hero']);
	assert.equal(result.favorite, true);
	assert.equal(result.name, 'new.png');
	assert.equal(result.blob, replacement);
	assert.equal(result.width, 512);
	assert.ok(result.updatedAt >= result.createdAt);
});

test('replaceFile rejects a different media kind', async () => {
	const repository = new MemoryRepository(originalAsset());
	const service = new AssetService(repository, {
		read: async () => ({ duration: 4, width: 512, height: 512 }),
		dataUrl: metadata.dataUrl
	});
	await assert.rejects(
		service.replaceFile('stable-id', image('clip.mp4', 'video/mp4')),
		/Replace this image with another image file/
	);
});

test('updated local bytes are used by transport serialization', async () => {
	const repository = new MemoryRepository(originalAsset());
	const service = new AssetService(repository, metadata);
	const result = await service.replaceFile('stable-id', image('fresh.png'));
	const transport = await service.toTransport(result, 'reference_image');
	assert.equal(transport.role, 'reference_image');
	assert.match(transport.url, /fresh\.png/);
});
