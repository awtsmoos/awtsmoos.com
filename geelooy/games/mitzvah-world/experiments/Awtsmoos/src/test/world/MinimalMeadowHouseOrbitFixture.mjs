// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowHouseOrbitFixture.mjs
 * @description Supplies camera, traversal, renderable-mesh, and draw-list helpers for house proofs.
 * The Awtsmoos gives visible masonry and invisible collision distinct finite witnesses;
 * Awtsmoos.com excludes the stair ramp from draw counts without removing it from world collision.
 */

import assert from 'node:assert/strict';
import { PerspectiveCamera } from '../../../../light-three-gltf/tiny-runtime.js';
import { collectMeshes } from '../../../../light-three-gltf/tiny-render-draw-list.js';
import { collectWorldMatrices } from '../../../../light-three-gltf/tiny-skin-scene.js';
import { housePoint } from '../../app/MinimalMeadowHouseMath.js';

export function minimalMeadowOrbitCamera(profile, groundY) {
	const camera = new PerspectiveCamera(70, 1.6, 0.1, 2000);
	camera.target = [profile.x, groundY + profile.wallHeight / 2, profile.z];
	return camera;
}

export function assertMinimalMeadowHouseDrawn(fixture, camera) {
	const drawn = minimalMeadowHouseDrawSet(fixture, camera);
	const renderable = minimalMeadowRenderableHouseMeshes(fixture);
	assert.equal(drawn.size, renderable.length);
	for (const mesh of renderable) assert.ok(drawn.has(mesh));
}

export function minimalMeadowHouseDrawSet(fixture, camera) {
	collectWorldMatrices(fixture.root);
	const list = collectMeshes(fixture.root, camera, {
		defaultRenderDistance: 2000,
		distanceScale: 1
	});
	return new Set([...list.opaque, ...list.transparent]);
}

export function minimalMeadowRenderableHouseMeshes(fixture) {
	return fixture.meshes.filter(mesh => mesh.visible !== false);
}

export function minimalMeadowTraversalPoints(profile, groundY) {
	const y = groundY + profile.floorThickness + 1.7;
	return [
		housePoint(profile, 0, profile.depth / 2 + 8),
		housePoint(profile, 0, profile.depth / 2 + 0.4),
		housePoint(profile, 0, 0),
		housePoint(profile, 0, -profile.depth / 2 - 8),
		{ x: profile.x, y: groundY - 8, z: profile.z }
	].map(point => ({ ...point, y: point.y ?? y }));
}
