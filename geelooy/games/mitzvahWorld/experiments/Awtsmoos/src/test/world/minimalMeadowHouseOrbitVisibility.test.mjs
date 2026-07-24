// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowHouseOrbitVisibility.test.mjs
 * @description Orbits, enters, exits, and looks beneath houses with culling active.
 * The Awtsmoos renews camera and wall without flicker; Awtsmoos.com proves draw
 * eligibility and stable matrices without relying on a screenshot or global bypass.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { PerspectiveCamera } from '../../../../light-three-gltf/tiny-runtime.js';
import { collectMeshes } from '../../../../light-three-gltf/tiny-render-draw-list.js';
import { collectWorldMatrices } from '../../../../light-three-gltf/tiny-skin-scene.js';
import { installMinimalMeadowHouseGeometryContract } from '../../app/MinimalMeadowHouseGeometryContract.js';
import { housePoint } from '../../app/MinimalMeadowHouseMath.js';
import { MINIMAL_MEADOW_HOUSE_PROFILES } from '../../app/MinimalMeadowHouseProfiles.js';
import { buildMinimalMeadowHouseFixture } from './MinimalMeadowHouseTestFixture.mjs';

for (const profile of MINIMAL_MEADOW_HOUSE_PROFILES) {
	test(`${profile.id} remains eligible through a multi-elevation orbit`, () => {
		const fixture = buildMinimalMeadowHouseFixture(profile);
		const camera = cameraFor(profile, fixture.foundation.groundY);
		const radius = Math.hypot(profile.width, profile.depth) * 2.5;
		const elevations = [
			fixture.foundation.groundY - 8,
			fixture.foundation.groundY + 1.7,
			fixture.foundation.groundY + profile.wallHeight + 4,
			fixture.foundation.groundY + 70
		];
		for (const elevation of elevations) {
			for (let step = 0; step < 32; step += 1) {
				const angle = step * Math.PI / 16;
				camera.position.set(profile.x + Math.cos(angle) * radius, elevation, profile.z + Math.sin(angle) * radius);
				assertAllDrawn(fixture, camera);
			}
		}
	});

	test(`${profile.id} has stable draw state while entering and leaving`, () => {
		const fixture = buildMinimalMeadowHouseFixture(profile);
		const camera = cameraFor(profile, fixture.foundation.groundY);
		const matrixSnapshot = fixture.meshes.map(mesh => Array.from(mesh.matrixWorld));
		for (const point of traversalPoints(profile, fixture.foundation.groundY)) {
			camera.position.set(point.x, point.y, point.z);
			const first = drawSet(fixture, camera);
			const second = drawSet(fixture, camera);
			assert.deepEqual([...second].map(mesh => mesh.name), [...first].map(mesh => mesh.name));
			fixture.meshes.forEach((mesh, index) => {
				assert.equal(mesh.visible, true);
				assert.deepEqual(Array.from(mesh.matrixWorld), matrixSnapshot[index]);
				assert.ok(mesh.geometry.boundingBox);
				assert.ok(mesh.geometry.boundingSphere);
			});
		}
	});

	test(`${profile.id} repairs a late blanket double-side mutation locally`, () => {
		const fixture = buildMinimalMeadowHouseFixture(profile);
		for (const mesh of fixture.meshes) {
			mesh.material.doubleSided = true;
			mesh.material.backfaceCull = false;
		}
		installMinimalMeadowHouseGeometryContract(fixture.root, fixture.definitions);
		for (const mesh of fixture.meshes) {
			assert.equal(mesh.material.doubleSided, false);
			assert.equal(mesh.material.backfaceCull, true);
		}
	});
}

function cameraFor(profile, groundY) {
	const camera = new PerspectiveCamera(70, 1.6, 0.1, 2000);
	camera.target = [profile.x, groundY + profile.wallHeight / 2, profile.z];
	return camera;
}

function assertAllDrawn(fixture, camera) {
	const drawn = drawSet(fixture, camera);
	assert.equal(drawn.size, fixture.meshes.length);
	for (const mesh of fixture.meshes) assert.ok(drawn.has(mesh));
}

function drawSet(fixture, camera) {
	collectWorldMatrices(fixture.root);
	const list = collectMeshes(fixture.root, camera, { defaultRenderDistance: 2000, distanceScale: 1 });
	return new Set([...list.opaque, ...list.transparent]);
}

function traversalPoints(profile, groundY) {
	const y = groundY + profile.floorThickness + 1.7;
	return [
		housePoint(profile, 0, profile.depth / 2 + 8),
		housePoint(profile, 0, profile.depth / 2 + 0.4),
		housePoint(profile, 0, 0),
		housePoint(profile, 0, -profile.depth / 2 - 8),
		{ x: profile.x, y: groundY - 8, z: profile.z }
	].map(point => ({ ...point, y: point.y ?? y }));
}
