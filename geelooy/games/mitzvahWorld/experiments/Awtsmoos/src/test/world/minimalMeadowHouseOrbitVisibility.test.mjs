// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowHouseOrbitVisibility.test.mjs
 * @description Orbits visible masonry while preserving the invisible stair collision ramp.
 * The Awtsmoos renews camera, wall, and ascent without flicker; Awtsmoos.com proves stable
 * draw eligibility while collision-only geometry remains present but deliberately unseen.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	installMinimalMeadowHouseGeometryContract
} from '../../app/MinimalMeadowHouseGeometryContract.js';
import { MINIMAL_MEADOW_HOUSE_PROFILES } from '../../app/MinimalMeadowHouseProfiles.js';
import {
	assertMinimalMeadowHouseDrawn,
	minimalMeadowHouseDrawSet,
	minimalMeadowOrbitCamera,
	minimalMeadowRenderableHouseMeshes,
	minimalMeadowTraversalPoints
} from './MinimalMeadowHouseOrbitFixture.mjs';
import {
	assertMinimalMeadowHouseSurface,
	countMinimalMeadowCameraSafeWalls
} from './MinimalMeadowHouseSurfaceAssertions.mjs';
import {
	buildMinimalMeadowHouseFixture
} from './MinimalMeadowHouseTestFixture.mjs';

for (const profile of MINIMAL_MEADOW_HOUSE_PROFILES) {
	test(`${profile.id} remains eligible through a multi-elevation orbit`, () => {
		const fixture = buildMinimalMeadowHouseFixture(profile);
		const camera = minimalMeadowOrbitCamera(profile, fixture.foundation.groundY);
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
				camera.position.set(
					profile.x + Math.cos(angle) * radius,
					elevation,
					profile.z + Math.sin(angle) * radius
				);
				assertMinimalMeadowHouseDrawn(fixture, camera);
			}
		}
	});

	test(`${profile.id} has stable draw state while entering and leaving`, () => {
		const fixture = buildMinimalMeadowHouseFixture(profile);
		const camera = minimalMeadowOrbitCamera(profile, fixture.foundation.groundY);
		const matrices = fixture.meshes.map(mesh => Array.from(mesh.matrixWorld));
		const renderable = new Set(minimalMeadowRenderableHouseMeshes(fixture));
		for (const point of minimalMeadowTraversalPoints(
			profile,
			fixture.foundation.groundY
		)) {
			camera.position.set(point.x, point.y, point.z);
			const first = minimalMeadowHouseDrawSet(fixture, camera);
			const second = minimalMeadowHouseDrawSet(fixture, camera);
			assert.deepEqual(
				[...second].map(mesh => mesh.name),
				[...first].map(mesh => mesh.name)
			);
			fixture.meshes.forEach((mesh, index) => {
				assert.equal(mesh.visible, renderable.has(mesh));
				assert.deepEqual(Array.from(mesh.matrixWorld), matrices[index]);
				assert.ok(mesh.geometry.boundingBox);
				assert.ok(mesh.geometry.boundingSphere);
			});
		}
	});

	test(`${profile.id} repairs a late blanket side mutation`, () => {
		const fixture = buildMinimalMeadowHouseFixture(profile);
		for (const mesh of fixture.meshes) {
			mesh.material.doubleSided = false;
			mesh.material.backfaceCull = true;
			mesh.frustumCulled = true;
		}
		installMinimalMeadowHouseGeometryContract(fixture.root, fixture.definitions);
		for (const mesh of fixture.meshes) {
			assertMinimalMeadowHouseSurface(mesh);
		}
		assert.ok(countMinimalMeadowCameraSafeWalls(fixture.meshes) > 0);
	});
}
