//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file minimalMeadowDemonMaterial.test.mjs
 * @description Proves demon surfaces remain readable and distinct without locally generated image textures.
 * Remote hide is authoritative: profile tint and vertex color preserve identity while a verified remote image is pending;
 * tests reject the obsolete canvas-painting path and keep native material construction behind Procedural Core.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	createMinimalDemonMaterial,
	normalizeMinimalDemonTint
} from '../../app/MinimalMeadowDemonMaterial.js';
import { createMinimalShadowCreatureMesh } from '../../app/MinimalMeadowCreatureMesh.js';
import { minimalShadowTextureDiagnostics } from '../../app/MinimalMeadowCreatureTexture.js';
import { prepareRemoteMaterialForHydration } from '../../assets/RemoteMaterialReadiness.js';

const VIOLET = Object.freeze({
	id: 'violet-one',
	surfaceFamily: 'violet-ash',
	tint: [0.72, 0.45, 0.95, 1]
});

test('materials remain independent while generated demon maps stay disabled', () => {
	const first = createMinimalDemonMaterial(VIOLET);
	const second = createMinimalDemonMaterial(VIOLET);
	assert.notEqual(first, second);
	assert.equal(first.mapImage, null);
	assert.equal(second.mapImage, null);
	assert.equal(first.vertexColors, true);
	assert.equal(first.doubleSided, true);
	assert.deepEqual(first.mapRepeat, [3.2, 2.55]);
	assert.equal(first.roughnessFactor, 0.78);
	assert.equal(first.metallicFactor, 0.035);
	assert.equal(first.texturePolicy.remoteOnly, true);
	assert.equal(first.texturePolicy.semanticRole, 'creature.fur');
	assert.ok(first.color.every(isReadableChannel));
	first.color[0] = 0.2;
	assert.notEqual(first.color[0], second.color[0]);
});

test('semantic families stay distinct while remote candidates replace canvas caches', () => {
	const violet = createMinimalDemonMaterial({ surfaceFamily: 'violet-ash' });
	const ember = createMinimalDemonMaterial({ surfaceFamily: 'scorched-ember' });
	assert.equal(violet.mapImage, null);
	assert.equal(ember.mapImage, null);
	assert.notEqual(violet.surfaceDiagnostics.family, ember.surfaceDiagnostics.family);
	assert.notDeepEqual(violet.color, ember.color);
	const receipt = prepareRemoteMaterialForHydration({ name: 'shadow demon' }, violet);
	assert.equal(receipt.role, 'creature.fur');
	assert.ok(receipt.candidates.length > 0);
	assert.match(receipt.selectedUrl || receipt.candidates[0], /^https:\/\//);
	const diagnostics = minimalShadowTextureDiagnostics();
	assert.equal(diagnostics.generatedTexturesEnabled, false);
	assert.equal(diagnostics.allocations, 0);
	assert.deepEqual(diagnostics.sourceSize, [0, 0]);
});

test('extreme colors normalize into a bounded daylight-readable range', () => {
	const black = normalizeMinimalDemonTint([0, 0, 0, 1]);
	const white = normalizeMinimalDemonTint([1, 1, 1, 1]);
	assert.deepEqual(black, [0.54, 0.34, 0.66, 1]);
	assert.ok(white.slice(0, 3).every(channel => channel >= 0.14));
	assert.ok(white.slice(0, 3).every(channel => channel <= 0.66));
});

test('continuous demon keeps one Core-owned render surface and one root bone', () => {
	const root = createMinimalShadowCreatureMesh({
		artifact: { type: 'test-artifact' },
		briah: { body: { sections: [{}, {}, {}] } }
	}, {
		id: 'contract-demon',
		surfaceFamily: 'weathered-stone',
		tint: [0.42, 0.38, 0.56, 1]
	});
	const renderSurfaces = root.children.filter(child => child.isMesh);
	const rootBones = root.children.filter(child => child.isBone);
	const mesh = root.userData.rig.mesh;
	assert.equal(renderSurfaces.length, 1);
	assert.equal(rootBones.length, 1);
	assert.equal(renderSurfaces[0], mesh);
	assert.equal(mesh.isSkinnedMesh, true);
	assert.equal(mesh.material.mapImage, null);
	assert.equal(mesh.material.texturePolicy.remoteOnly, true);
	assert.equal(mesh.material.texturePolicy.semanticRole, 'creature.fur');
	for (const name of ['position', 'normal', 'color', 'uv', 'joints', 'weights']) {
		assert.ok(mesh.geometry.attributes[name]?.count > 0, `${name} must remain populated`);
	}
	assert.equal(root.userData.proceduralCore.meshCount, 1);
	assert.equal(root.userData.proceduralCore.material.family, 'weathered-stone');
});

function isReadableChannel(channel, index) {
	return index === 3 || channel >= 0.14;
}
