// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GrassGroundMaterial.test.js
 * @description Proves the Chapter 4 Task 4 texture-only contract: one shared
 * grass ground material from the existing catalog (no new fetch), correct
 * sampling flags (sRGB, mipmaps, LinearMipmapLinear, anisotropy), repeat
 * derived from real source pixels, no stretched tile at any terrain size,
 * and material/texture counts stable after repeated chunk reloads.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	GRASS_GROUND_ANISOTROPY_DESKTOP,
	GRASS_GROUND_ANISOTROPY_MOBILE,
	GRASS_GROUND_MATERIAL_ID,
	GRASS_GROUND_SOURCE,
	MAX_TILE_WORLD_METERS,
	createGrassGroundMaterialSpec,
	getSharedGrassGroundMaterial,
	grassGroundMaterialCount,
	grassGroundSamplingFor,
	grassGroundTexturePolicy,
	packageGrassGroundMaterialEvidence,
	resetGrassGroundMaterial
} from './GrassGroundMaterial.js';
import { GRASS_URLS } from '../TerrainTextureCatalog.js';

test('source is the existing catalog only, no new fetch', () => {
	assert.equal(GRASS_GROUND_SOURCE.primary, GRASS_URLS[0]);
	assert.ok(GRASS_GROUND_SOURCE.primary.endsWith('textures/essential-grass.jpg'));
	assert.deepEqual([...GRASS_GROUND_SOURCE.alternates], [GRASS_URLS[1], GRASS_URLS[2]]);
	assert.equal(GRASS_GROUND_SOURCE.provenance, 'existing-catalog-no-new-fetch');
});

test('sampling flags are correct: sRGB, mipmaps, trilinear, repeat wrap, anisotropy', () => {
	const desktop = grassGroundTexturePolicy({ quality: 'high' });
	assert.equal(desktop.colorSpace, 'srgb');
	assert.equal(desktop.mipmaps, true);
	assert.equal(desktop.minFilter, 'LinearMipmapLinear');
	assert.equal(desktop.magFilter, 'Linear');
	assert.equal(desktop.wrapS, 'RepeatWrapping');
	assert.equal(desktop.wrapT, 'RepeatWrapping');
	assert.equal(desktop.anisotropy, GRASS_GROUND_ANISOTROPY_DESKTOP);
	assert.equal(desktop.anisotropy, 8);
	const mobile = grassGroundTexturePolicy({ mobile: true, quality: 'high' });
	assert.equal(mobile.anisotropy, GRASS_GROUND_ANISOTROPY_MOBILE);
	assert.equal(mobile.anisotropy, 4);
});

test('repeat is derived from real source pixels, not an arbitrary integer', () => {
	// 256m terrain, 2048px source, 72 texels/m at high: 256 * 72 / 2048 = 9.
	const sampling = grassGroundSamplingFor({ quality: 'high', worldDepth: 256, worldWidth: 256 });
	assert.deepEqual([...sampling.repeat], [9, 9]);
	assert.equal(sampling.targetTexelsPerMeter, 72);
	assert.equal(sampling.effectiveTexelsPerMeter, 72);
	// Tile world size is 2048 / 72 ≈ 28.4m — a foreground texel is ~1.4cm, not a stretched photograph.
	assert.ok(Math.abs(sampling.tileWorld[0] - 2048 / 72) < 1e-9);
	assert.ok(sampling.tileWorld[0] <= MAX_TILE_WORLD_METERS);
});

test('no stretched or coarse foreground sampling at any terrain size', () => {
	for (const world of [64, 256, 1024, 4096]) {
		const sampling = grassGroundSamplingFor({ quality: 'high', worldDepth: world, worldWidth: world });
		// Tile size depends only on source pixels and density, never on terrain extent.
		assert.ok(Math.abs(sampling.tileWorld[0] - 2048 / 72) < 1e-9, `world ${world} stretched the tile`);
		assert.ok(sampling.tileWorld[0] <= MAX_TILE_WORLD_METERS);
		assert.ok(sampling.effectiveTexelsPerMeter >= 72);
	}
	// An oversized source can never stretch a tile past the guard: density rises instead.
	const huge = grassGroundSamplingFor({ quality: 'low', sourceHeight: 8192, sourceWidth: 8192 });
	assert.ok(huge.tileWorld[0] <= MAX_TILE_WORLD_METERS, `tile ${huge.tileWorld[0]} exceeds guard`);
	assert.ok(huge.effectiveTexelsPerMeter >= 8192 / MAX_TILE_WORLD_METERS);
	// A small source keeps small tiles (denser, never coarser than the target).
	const small = grassGroundSamplingFor({ quality: 'high', sourceHeight: 512, sourceWidth: 512 });
	assert.ok(small.tileWorld[0] < 28.4);
});

test('one shared material across repeated chunk reloads', () => {
	resetGrassGroundMaterial();
	const calls = [];
	const factory = (options) => {
		calls.push(options);
		return { fake: true, options };
	};
	const first = getSharedGrassGroundMaterial({ createMaterial: factory, quality: 'high' });
	// Ten chunk reloads, different chunk ids, same runtime.
	for (let reload = 0; reload < 10; reload += 1) {
		const again = getSharedGrassGroundMaterial({ chunkId: `chunk-${reload}`, createMaterial: factory, quality: 'high' });
		assert.equal(again, first, `reload ${reload} created a second material`);
	}
	assert.equal(calls.length, 1, 'factory must run exactly once');
	assert.equal(grassGroundMaterialCount(), 1);
	const options = calls[0];
	assert.equal(options.anisotropy, 8);
	assert.deepEqual([...options.mapRepeat], [9, 9]);
	assert.equal(options.textureUrl, GRASS_URLS[0]);
	assert.equal(options.texturePolicy.colorSpace, 'srgb');
	assert.equal(options.texturePolicy.mipmaps, true);
	assert.equal(options.texturePolicy.minFilter, 'LinearMipmapLinear');
	assert.equal(options.userData.AwtsmoosSharedGrassGround.materialId, GRASS_GROUND_MATERIAL_ID);
	resetGrassGroundMaterial();
	assert.equal(grassGroundMaterialCount(), 0);
});

test('spec carries the full sampling contract', () => {
	const spec = createGrassGroundMaterialSpec({ quality: 'cinematic' });
	assert.equal(spec.materialId, GRASS_GROUND_MATERIAL_ID);
	assert.equal(spec.sourceUrl, GRASS_URLS[0]);
	assert.equal(spec.sampling.targetTexelsPerMeter, 96);
	assert.ok(spec.tileWorld[0] <= MAX_TILE_WORLD_METERS);
	assert.ok(Math.abs(spec.tileWorld[0] - 2048 / 96) < 1e-9);
});

test('evidence proves the texture-only contract and catches a second material', () => {
	const sampling = grassGroundSamplingFor({ quality: 'high' });
	const good = packageGrassGroundMaterialEvidence({
		materialCount: 1,
		reloads: 10,
		sampling,
		textureCount: 1
	});
	assert.equal(good.ok, true);
	assert.equal(good.checks.singleMaterial, true);
	assert.equal(good.checks.singleTexture, true);
	assert.equal(good.checks.noStretchedTile, true);
	assert.equal(good.checks.correctSamplingFlags, true);
	assert.equal(good.checks.stableAfterReloads, true);
	const bad = packageGrassGroundMaterialEvidence({
		materialCount: 2,
		reloads: 10,
		sampling,
		textureCount: 2
	});
	assert.equal(bad.ok, false);
	assert.equal(bad.checks.singleMaterial, false);
	assert.equal(bad.checks.singleTexture, false);
	assert.equal(bad.checks.stableAfterReloads, false);
});
