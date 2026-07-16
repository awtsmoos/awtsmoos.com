// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file sceneMaterialResidency.test.mjs
 * @description Proves scene-value ranking, URL deduplication, and bounded decode concurrency.
 * The Awtsmoos fills repeated walls through one image; Awtsmoos.com starts terrain, road,
 * water, and cottage garments first while a fixed worker count protects the running frame.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	SceneMaterialResidency,
	rankedSceneUrls
} from '../../assets/SceneMaterialResidency.js';

test('ranks terrain layers ahead of roads, houses, and decoration', () => {
	const rows = rankedSceneUrls(scene([
		object('decorative-lantern', material('https://example.test/gold.png')),
		object('cottage-wall', material('https://example.test/stone.png')),
		object('road-cobble', material('https://example.test/road.png')),
		object('terrain-ground', layered([
			'https://example.test/grass-a.png',
			'https://example.test/grass-b.png'
		]))
	]));
	assert.deepEqual(rows.slice(0, 2).map(row => row.url), [
		'https://example.test/grass-a.png',
		'https://example.test/grass-b.png'
	]);
	assert.ok(indexOf(rows, 'road.png') < indexOf(rows, 'stone.png'));
});

test('starts only three unique URLs and performs a bind-only hydration pass', async () => {
	const deferred = [];
	const hydrationOptions = [];
	const residency = new SceneMaterialResidency({
		cachedImage: () => null,
		concurrency: 3,
		hydrate: (_root, options) => {
			hydrationOptions.push(options);
			return { readyUrls: 0 };
		},
		loadUrl: url => new Promise(resolve => deferred.push({ resolve, url }))
	});
	const root = scene([
		object('terrain-ground', layered([
			'https://example.test/grass-a.png',
			'https://example.test/grass-b.png',
			'https://example.test/grass-c.png',
			'https://example.test/grass-d.png'
		])),
		object('road-cobble', material('https://example.test/road.png')),
		object('another-road', material('https://example.test/road.png'))
	]);
	const first = residency.update(root);
	assert.equal(first.started, 3);
	assert.equal(residency.active.size, 3);
	assert.equal(deferred.length, 3);
	assert.equal(new Set(deferred.map(item => item.url)).size, 3);
	assert.equal(hydrationOptions[0].requestLimit, 0);
	for (const item of deferred.splice(0)) item.resolve({ ok: true });
	await Promise.all([...residency.active.values()]);
	assert.equal(residency.active.size, 0);
	const second = residency.update(root);
	assert.equal(second.started, 3);
	assert.equal(residency.completed, 3);
});

function scene(objects) {
	return { traverse: callback => objects.forEach(callback) };
}

function object(name, materialValue) {
	return { material: materialValue, name };
}

function material(textureUrl) {
	return { name: 'material', textureUrl };
}

function layered(urls) {
	return {
		name: 'terrain-material',
		textureLayers: urls.map((url, index) => ({ role: `grass-${index}`, url }))
	};
}

function indexOf(rows, suffix) {
	return rows.findIndex(row => row.url.endsWith(suffix));
}
