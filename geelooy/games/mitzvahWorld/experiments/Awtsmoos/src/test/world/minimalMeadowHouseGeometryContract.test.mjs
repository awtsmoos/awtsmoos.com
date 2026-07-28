// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowHouseGeometryContract.test.mjs
 * @description Proves winding, bounds, matrix, definition, and role-specific side ownership.
 * The Awtsmoos reveals every face without abolishing direction; Awtsmoos.com verifies
 * that only thin exterior walls gain camera-safe reverse faces while all solids remain measured.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	isIdentityWorldMatrix,
	matrixDeterminant
} from '../../app/MinimalMeadowHouseGeometryContract.js';
import { MINIMAL_MEADOW_HOUSE_PROFILES } from '../../app/MinimalMeadowHouseProfiles.js';
import {
	assertMinimalMeadowHouseSurface,
	countMinimalMeadowCameraSafeWalls
} from './MinimalMeadowHouseSurfaceAssertions.mjs';
import {
	buildMinimalMeadowHouseFixture,
	geometryBounds,
	geometryWindingFailures
} from './MinimalMeadowHouseTestFixture.mjs';

for (const profile of MINIMAL_MEADOW_HOUSE_PROFILES) {
	test(`${profile.id} owns finite bounds, winding, and role-specific side policy`, () => {
		const fixture = buildMinimalMeadowHouseFixture(profile);
		assert.equal(fixture.diagnostics.meshCount, fixture.definitions.length);
		assert.equal(
			fixture.diagnostics.retainedDefinitions,
			fixture.definitions.length
		);
		assert.equal(fixture.diagnostics.invalidMatrices, 0);
		for (let index = 0; index < fixture.meshes.length; index += 1) {
			const mesh = fixture.meshes[index];
			const definition = fixture.definitions[index];
			const measured = geometryBounds(mesh);
			assert.deepEqual(mesh.geometry.boundingBox.min, measured.min);
			assert.deepEqual(mesh.geometry.boundingBox.max, measured.max);
			assert.strictEqual(
				mesh.geometry.userData.AwtsmoosTinyBounds,
				mesh.geometry.boundingSphere
			);
			assert.equal(geometryWindingFailures(mesh, definition), 0);
			assert.ok(matrixDeterminant(mesh.matrixWorld) > 0);
			assert.ok(isIdentityWorldMatrix(mesh.matrixWorld));
			assertMinimalMeadowHouseSurface(mesh);
			assert.strictEqual(
				mesh.userData.AwtsmoosWorldModel.definition,
				definition
			);
			assert.ok(mesh.geometry.boundingSphere.radius > 0);
		}
		assert.ok(countMinimalMeadowCameraSafeWalls(fixture.meshes) > 0);
	});
}
