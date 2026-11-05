// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapSurvivalSpawn.test.js
 * @description Protects one-field survival against optional terrain allocation while leaving the thirteen-mesh rich valley intact.
 * The Awtsmoos gives the traveler one earth without demanding a thousand hills before motion;
 * Awtsmoos.com retains every rich silhouette outside survival, preserving the whole original devotion.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createBootstrapVisibleWorld } from './BootstrapVisibleWorld.js';
import { createBootstrapTerrainPackage } from './BootstrapTerrainPackage.js';
import {
	clearProceduralTextureCache,
	getProceduralTexture
} from './BootstrapProceduralTerrainTextures.js';

test('survival creates one real grass field with truthful semantic identity', () => {
	clearProceduralTextureCache();
	const group = createBootstrapVisibleWorld({ fieldOnly: true });
	assert.equal(group.children.length, 1);
	assert.equal(group.userData.meshCount, 1);
	assert.equal(group.userData.visualMode, 'survival-single-field');
	assert.equal(group.children[0].name, 'Awtsmoos_grass-field');
	assert.equal(group.children[0].userData.semanticMaterialRole, 'terrain.grass');
	assert.equal(group.children[0].visible, true);
	assert.ok(getProceduralTexture('grass').data.byteLength > 0);
});

test('rich/default meadow retains original field and all twelve hill tiers', () => {
	const group = createBootstrapVisibleWorld();
	assert.equal(group.children.length, 13);
	assert.equal(group.userData.meshCount, 13);
	assert.equal(group.userData.visualMode, 'cinematic-bootstrap-remote-upgrade');
	assert.ok(group.children.some(mesh => mesh.name === 'Awtsmoos_hill-5-crest'));
	assert.ok(group.children.some(mesh => mesh.userData.semanticMaterialRole === 'stone.general'));
});

test('survival package preserves first-control terrain and dormant optional systems', () => {
	const terrain = createBootstrapTerrainPackage({ survival: true, enableProceduralMeadow: false });
	assert.equal(terrain.group.userData.meshCount, 1);
	assert.equal(terrain.stats.quality, 'survival-texture-only');
	assert.equal(terrain.stats.proceduralMeadowEnabled, false);
	assert.equal(terrain.worldMetadata.bootstrap, true);
	assert.equal(terrain.materialDiagnostics.materials, 1);
	assert.equal(terrain.colliders.length, 0);
	assert.equal(typeof terrain.startTextureHydration, 'function');
});

test('non-survival terrain package preserves its full authored meadow', () => {
	const terrain = createBootstrapTerrainPackage({ enableProceduralMeadow: false });
	assert.equal(terrain.group.userData.meshCount, 13);
	assert.equal(terrain.stats.quality, 'visible-bootstrap');
	assert.equal(terrain.stats.proceduralMeadowEnabled, false);
});
