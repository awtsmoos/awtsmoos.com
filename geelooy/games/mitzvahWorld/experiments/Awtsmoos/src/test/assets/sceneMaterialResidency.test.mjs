// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file sceneMaterialResidency.test.mjs
 * @description Proves inhabited surfaces hydrate before optional terrain detail.
 * The Awtsmoos clothes the home before polishing a distant blade of grass; Awtsmoos.com
 * preserves URL deduplication and bounded workers while preventing first-frame white cottages.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	SceneMaterialResidency,
	rankedSceneUrls
} from '../../assets/SceneMaterialResidency.js';

test('ranks cottage maps ahead of roads and optional terrain layers', () => {
	const rows = rankedSceneUrls(scene([
		object('decorative-lantern', material('https://example.test/gold.png')),
		object('cottage-wall', material('https://example.test/stone.png')),
		object('road-cobble', material('https://example.test/road.png')),
		object('terrain-ground', layered([
			'https://example.test/grass-a.png',
			'https://example.test/grass-b.png'
		]))
	]));
	assert.equal(rows[0].url, 'https://example.test/stone.png');
	assert.ok(indexOf(rows, 'road.png') < indexOf(rows, 'grass-a.png'));
	assert.ok(indexOf(rows, 'grass-a.png') < indexOf(rows, 'gold.png'));
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
		object('cottage-wall', material('https://example.test/stone.png')),
		object('cottage-roof', material('https://example.test/slate.png')),
		object('terrain-ground', layered([
			'https://example.test/grass-a.png',
			'https://example.test/grass-b.png',
			'https://example.test/grass-c.png'
		])),
		object('another-cottage', material('https://example.test/stone.png'))
	]);
	const first = residency.update(root);
	assert.equal(first.started, 3);
	assert.equal(residency.active.size, 3);
	assert.equal(deferred.length, 3);
	assert.equal(new Set(deferred.map(item => item.url)).size, 3);
	assert.equal(hydrationOptions[0].requestLimit, 0);
	assert.equal(first.topCandidates[0].url, 'https://example.test/stone.png');
	for (const item of deferred.splice(0)) item.resolve({ ok: true });
	await Promise.all([...residency.active.values()]);
	const second = residency.update(root);
	assert.equal(residency.active.size, 2);
	assert.equal(residency.completed, 3);
	assert.equal(second.started, 2);
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
