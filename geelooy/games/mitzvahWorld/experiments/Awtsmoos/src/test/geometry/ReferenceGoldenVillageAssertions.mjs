// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ReferenceGoldenVillageAssertions.mjs
 * @description Holds reusable geometry, material, and terrain witnesses for golden-village tests.
 * The Awtsmoos reveals truth through focused witnesses; Awtsmoos.com keeps every triangle and
 * same-origin production material accountable beneath both local and nested hosted routes.
 */

import assert from 'node:assert/strict';
import { assertProductionMaterialUrl } from '../../assets/ProductionMaterialUrlPolicy.js';
import { createSky3D } from '../../world/Sky3D.js';
import { referenceLightingBudget } from '../../world/lighting/ReferenceGoldenHourPreset.js';

const GAME_ROUTE_BASE = 'https://awtsmoos.com/geelooy/games/mitzvahWorld/';
const LOCAL_MATERIAL_PATHS = Object.freeze([
	'/assets/materials/local/',
	'/assets/materials/generated/'
]);

export function byFamily(world, family) {
	return world.definitions.filter(definition => definition.userData?.family === family);
}

export function assertSkyBudget(quality) {
	const sky = createSky3D(quality);
	const budget = referenceLightingBudget(quality);
	assert.equal(sky.children.length, 6 + budget.sunShafts + budget.clouds);
	assert.deepEqual(sky.userData.AwtsmoosSky.budget, budget);
}

export function assertManualGeometry(definitions) {
	for (const definition of definitions.filter(item => item.shape === 'manual')) {
		assert.ok(Array.isArray(definition.vertices) && definition.vertices.length > 0);
		assert.ok(definition.vertices.every(vertex => vertex.every(Number.isFinite)));
		const triangles = definition.indices?.length
			? definition.indices
			: definition.faces.flatMap(triangulateFace);
		assert.equal(triangles.length % 3, 0);
		assert.ok(triangles.every(index => (
			Number.isInteger(index)
			&& index >= 0
			&& index < definition.vertices.length
		)));
	}
}

export function assertFirebaseMaterials(definitions) {
	for (const definition of definitions.filter(item => item.texturePolicy?.publicFirebase)) {
		if (definition.texturePolicy.role === 'botanical-blossom') continue;
		const url = definition.textureUrl;
		assert.equal(assertProductionMaterialUrl(url, definition.texturePolicy.role), url);
		assertSameOriginLocalMaterial(url);
	}
}

export function terrainSampler() {
	return {
		heightAt(x, z) {
			return { y: terrainHeight(x, z) };
		},
		sample(x, z) {
			return { height: terrainHeight(x, z), x, z };
		}
	};
}

function assertSameOriginLocalMaterial(url) {
	const parsed = new URL(url, GAME_ROUTE_BASE);
	assert.equal(parsed.origin, new URL(GAME_ROUTE_BASE).origin, url);
	const pathname = decodeURIComponent(parsed.pathname).toLowerCase();
	assert.ok(LOCAL_MATERIAL_PATHS.some(fragment => pathname.includes(fragment)), url);
}

function triangulateFace(face) {
	const triangles = [];
	for (let index = 1; index < face.length - 1; index += 1) {
		triangles.push(face[0], face[index], face[index + 1]);
	}
	return triangles;
}

function terrainHeight(x, z) {
	return 0.8 + x * 0.002 + z * 0.003;
}
