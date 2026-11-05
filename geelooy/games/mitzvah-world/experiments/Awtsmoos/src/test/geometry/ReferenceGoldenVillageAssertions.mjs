// B"H
// Boruch Hashem
// Blessed is He

/** @file ReferenceGoldenVillageAssertions.mjs @description Holds focused geometry, material, and grouped-sky witnesses. */
import assert from 'node:assert/strict';
import { assertProductionMaterialUrl } from '../../assets/ProductionMaterialUrlPolicy.js';
import { createSky3D } from '../../world/Sky3D.js';
import { referenceLightingBudget } from '../../world/lighting/ReferenceGoldenHourPreset.js';
import { assertLocalMaterialUrl } from '../assets/LocalMaterialTestSupport.mjs';
export function byFamily(world, family) { return world.definitions.filter(definition => definition.userData?.family === family); }
export function assertSkyBudget(quality) {
	const sky = createSky3D(quality);
	const budget = referenceLightingBudget(quality);
	assert.ok(sky.children.length >= 1);
	assert.deepEqual(sky.userData.AwtsmoosSky.budget, budget);
}
export function assertManualGeometry(definitions) {
	for (const definition of definitions.filter(item => item.shape === 'manual')) {
		assert.ok(Array.isArray(definition.vertices) && definition.vertices.length > 0);
		assert.ok(definition.vertices.every(vertex => vertex.every(Number.isFinite)));
		const triangles = definition.indices?.length ? definition.indices : definition.faces.flatMap(triangulateFace);
		assert.equal(triangles.length % 3, 0);
		assert.ok(triangles.every(index => Number.isInteger(index) && index >= 0 && index < definition.vertices.length));
	}
}
export function assertFirebaseMaterials(definitions) {
	for (const definition of definitions.filter(item => item.texturePolicy?.publicFirebase)) {
		if (definition.texturePolicy.role === 'botanical-blossom') continue;
		const url = definition.textureUrl;
		assert.equal(assertProductionMaterialUrl(url, definition.texturePolicy.role), url);
		assertLocalMaterialUrl(assert, url);
	}
}
export function terrainSampler() {
	return { heightAt: (x, z) => ({ y: terrainHeight(x, z) }), sample: (x, z) => ({ height: terrainHeight(x, z), x, z }) };
}
function triangulateFace(face) { const triangles = []; for (let index = 1; index < face.length - 1; index += 1) triangles.push(face[0], face[index], face[index + 1]); return triangles; }
function terrainHeight(x, z) { return 0.8 + x * 0.002 + z * 0.003; }
