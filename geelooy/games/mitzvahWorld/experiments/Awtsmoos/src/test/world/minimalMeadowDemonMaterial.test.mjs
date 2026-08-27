// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowDemonMaterial.test.mjs
 * @description Proves readable demon materials share texture resources without shared mutation.
 * The Awtsmoos shines through dark violet, ember, and stone; Awtsmoos.com verifies one
 * render surface, one living skeleton, bounded caches, measured color, and rich texture truth.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	createMinimalDemonMaterial,
	normalizeMinimalDemonTint
} from '../../app/MinimalMeadowDemonMaterial.js';
import { createMinimalShadowCreatureMesh } from '../../app/MinimalMeadowCreatureMesh.js';
import { minimalShadowTextureDiagnostics } from '../../app/MinimalMeadowCreatureTexture.js';
import { createDemonMaterialTestDocument } from './minimalMeadowDemonMaterialTestVessel.mjs';

const documentValue = createDemonMaterialTestDocument();

test('materials share images while actor feedback remains independent', () => {
	const profile = {
		id: 'violet-one',
		surfaceFamily: 'violet-ash',
		tint: [0.72, 0.45, 0.95, 1]
	};
	const first = createMinimalDemonMaterial(profile, documentValue);
	const second = createMinimalDemonMaterial(profile, documentValue);
	assert.notEqual(first, second);
	assert.equal(first.mapImage, second.mapImage);
	assert.equal(first.vertexColors, true);
	assert.equal(first.doubleSided, true);
	assert.deepEqual(first.mapRepeat, [3.2, 2.55]);
	assert.equal(first.roughnessFactor, 0.78);
	assert.equal(first.metallicFactor, 0.035);
	assert.equal(first.anisotropy, 6);
	assert.ok(first.color.every(isReadableChannel));
	assert.ok(first.color.slice(0, 3).every((channel) => channel < 0.67));
	first.color[0] = 0.2;
	assert.notEqual(first.color[0], second.color[0]);
});

test('controlled families bound cache growth and preserve variation', () => {
	const violet = createMinimalDemonMaterial({
		surfaceFamily: 'violet-ash'
	}, documentValue);
	const ember = createMinimalDemonMaterial({
		surfaceFamily: 'scorched-ember'
	}, documentValue);
	assert.notEqual(violet.mapImage, ember.mapImage);
	assert.match(violet.mapImage.dataset.url, /violet-ash/);
	assert.match(ember.mapImage.dataset.url, /scorched-ember/);
	const diagnostics = minimalShadowTextureDiagnostics();
	assert.ok(diagnostics.cachedFamilies.length <= diagnostics.familyLimit);
	assert.deepEqual(diagnostics.sourceSize, [256, 256]);
});

test('extreme colors normalize into a bounded daylight-readable range', () => {
	const black = normalizeMinimalDemonTint([0, 0, 0, 1]);
	const white = normalizeMinimalDemonTint([1, 1, 1, 1]);
	assert.deepEqual(black, [0.54, 0.34, 0.66, 1]);
	assert.ok(white.slice(0, 3).every((channel) => channel >= 0.14));
	assert.ok(white.slice(0, 3).every((channel) => channel <= 0.66));
});

test('continuous demon keeps one render surface and one root bone', () => {
	const root = createContractDemon();
	const renderSurfaces = root.children.filter((child) => child.isMesh);
	const rootBones = root.children.filter((child) => child.isBone);
	const mesh = root.userData.rig.mesh;
	assert.equal(renderSurfaces.length, 1);
	assert.equal(rootBones.length, 1);
	assert.equal(renderSurfaces[0], mesh);
	assert.equal(mesh.userData.bootstrapVisual, true);
	assert.equal(mesh.isSkinnedMesh, true);
	assert.equal(mesh.material.mapImage.width, 256);
	for (const name of ['position', 'normal', 'color', 'uv', 'joints', 'weights']) {
		assert.ok(mesh.geometry.attributes[name]?.count > 0, `${name} must remain populated`);
	}
	assert.equal(root.userData.proceduralCore.meshCount, 1);
	assert.equal(root.userData.proceduralCore.material.family, 'weathered-stone');
});

function createContractDemon() {
	return createMinimalShadowCreatureMesh({
		artifact: { type: 'test-artifact' },
		briah: { body: { sections: [{}, {}, {}] } }
	}, {
		id: 'contract-demon',
		surfaceFamily: 'weathered-stone',
		tint: [0.42, 0.38, 0.56, 1]
	}, documentValue);
}

function isReadableChannel(channel, index) {
	return index === 3 || channel >= 0.14;
}
