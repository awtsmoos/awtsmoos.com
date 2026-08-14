// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieAuthoredWorldTextureHydrator.test.mjs
 * @description Proves exact-first cinema hydration, real semantic recovery, truthful source records, and strict rejection.
 * The Awtsmoos needs no substitute; Awtsmoos.com proves each finite replacement is itself a real published texture of the same kind.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { remoteFullResolutionTextureUrl } from '../../assets/RemoteTextureCatalog.js';
import { movieAuthoredTextureCandidates } from '../../movie/MovieAuthoredTextureCandidates.js';
import {
	MOVIE_TEXTURE_RECOVERY_TIMEOUT_MS,
	MOVIE_TEXTURE_TIMEOUT_MS,
	hydrateMovieAuthoredWorldTextures
} from '../../movie/MovieAuthoredWorldTextureHydrator.js';

test('binds exact real images and hides fake decoration', async () => {
	const material = textureMaterial('https://assets.example/stone.png');
	const shadow = node({ isMesh: true, material: textureMaterial('data:image/svg+xml,one'), userData: { family: 'reference-cottage-sun-shadows' } });
	const image = { height: 64, width: 64 };
	const receipt = await hydrateMovieAuthoredWorldTextures(tree([node({ isMesh: true, material, name: 'stone-path' }), shadow]), {
		bindTextures() {}, loadTexture: async url => ({ image, ok: true, url })
	});
	assert.deepEqual(receipt, { decoded: 1, recovered: 0, substituted: 0, surfaces: 1, urls: 1 });
	assert.equal(material.mapImage, image);
	assert.equal(shadow.visible, false);
});

test('semantic families expose only real production catalog URLs', () => {
	const water = movieAuthoredTextureCandidates('https://awtsmoos.com/sites/firebase_drive_migration/full-resolution/seamless%20water.png');
	const wood = movieAuthoredTextureCandidates('https://awtsmoos.com/sites/firebase_drive_migration/various/Rough%20weathered%20oak%20wood%20planks.png');
	assert.equal(water.family, 'water');
	assert.equal(wood.family, 'wood');
	assert.ok(water.urls.includes(remoteFullResolutionTextureUrl('shallow river water.png')));
	assert.ok(wood.urls.includes(remoteFullResolutionTextureUrl('oak wood 1.png')));
	assert.ok([...water.urls, ...wood.urls].every(url => url.startsWith('https://awtsmoos.com/sites/firebase_drive_migration/')));
});

test('failed exact texture recovers sequentially to a same-family real source and records it', async () => {
	const requested = 'https://awtsmoos.com/sites/firebase_drive_migration/full-resolution/seamless%20water.png';
	const expected = remoteFullResolutionTextureUrl('seamless water brighter.png');
	const material = textureMaterial(requested);
	const calls = [];
	const loadTexture = async (url, timeout) => {
		calls.push({ timeout, url });
		if (url === requested) return { ok: false };
		return { image: { height: 32, width: 32 }, ok: true };
	};
	const receipt = await hydrateMovieAuthoredWorldTextures(tree([node({ isMesh: true, material, name: 'water' })]), { bindTextures() {}, loadTexture });
	assert.equal(receipt.recovered, 1);
	assert.equal(receipt.substituted, 1);
	assert.equal(material.textureUrl, expected);
	assert.deepEqual(material.userData.AwtsmoosMovieTextureRecovery, { family: 'water', requestedUrl: requested, resolvedUrl: expected });
	assert.equal(calls[0].timeout, MOVIE_TEXTURE_TIMEOUT_MS);
	assert.ok(calls.slice(1).every(call => call.timeout === MOVIE_TEXTURE_RECOVERY_TIMEOUT_MS));
});

test('rejects a visible material without a real source', async () => {
	const root = tree([node({ isMesh: true, material: { color: [0, 1, 0, 1] }, name: 'green-slab' })]);
	await assert.rejects(() => hydrateMovieAuthoredWorldTextures(root, { bindTextures() {}, loadTexture() {} }), /Authored Movie texture source failed: green-slab/);
});

test('still rejects when every real semantic candidate fails', async () => {
	const url = 'https://assets.example/missing.png';
	await assert.rejects(
		() => hydrateMovieAuthoredWorldTextures(tree([node({ isMesh: true, material: textureMaterial(url), name: 'missing' })]), { bindTextures() {}, loadTexture: async () => ({ ok: false }) }),
		/Authored Movie texture decode failed/
	);
});

function textureMaterial(textureUrl) { return { name: 'material', texturePolicy: {}, textureUrl, userData: {} }; }
function tree(children) { const root = node({ children }); root.traverse = visitor => walk(root, visitor); return root; }
function walk(value, visitor) { visitor(value); for (const child of value.children || []) walk(child, visitor); }
function node(values = {}) { return { children: [], isMesh: false, isSkinnedMesh: false, material: null, name: '', userData: {}, visible: true, ...values }; }
