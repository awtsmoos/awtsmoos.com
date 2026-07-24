// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowHouseGeometryContract.test.mjs
 * @description Proves winding, bounds, matrix, definition, and side ownership.
 * The Awtsmoos reveals every face without abolishing its direction; Awtsmoos.com
 * checks every vertex and every house instead of trusting a favorable camera.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	isIdentityWorldMatrix,
	matrixDeterminant
} from '../../app/MinimalMeadowHouseGeometryContract.js';
import { MINIMAL_MEADOW_HOUSE_PROFILES } from '../../app/MinimalMeadowHouseProfiles.js';
import {
	buildMinimalMeadowHouseFixture,
	geometryBounds,
	geometryWindingFailures
} from './MinimalMeadowHouseTestFixture.mjs';

for (const profile of MINIMAL_MEADOW_HOUSE_PROFILES) {
	test(`${profile.id} owns finite bounds, winding, and side policy`, () => {
		const fixture = buildMinimalMeadowHouseFixture(profile);
		assert.equal(fixture.diagnostics.meshCount, fixture.definitions.length);
		assert.equal(fixture.diagnostics.retainedDefinitions, fixture.definitions.length);
		assert.equal(fixture.diagnostics.invalidMatrices, 0);
		for (let index = 0; index < fixture.meshes.length; index += 1) {
			const mesh = fixture.meshes[index];
			const definition = fixture.definitions[index];
			const measured = geometryBounds(mesh);
			assert.deepEqual(mesh.geometry.boundingBox.min, measured.min);
			assert.deepEqual(mesh.geometry.boundingBox.max, measured.max);
			assert.strictEqual(mesh.geometry.userData.AwtsmoosTinyBounds, mesh.geometry.boundingSphere);
			assert.equal(geometryWindingFailures(mesh, definition), 0);
			assert.ok(matrixDeterminant(mesh.matrixWorld) > 0);
			assert.ok(isIdentityWorldMatrix(mesh.matrixWorld));
			assert.equal(mesh.material.doubleSided, false);
			assert.equal(mesh.material.backfaceCull, true);
			assert.equal(mesh.frustumCulled, true);
			assert.strictEqual(mesh.userData.AwtsmoosWorldModel.definition, definition);
			assert.equal(mesh.userData.AwtsmoosHouseSurface.sidedness, 'front');
			assert.ok(mesh.geometry.boundingSphere.radius > 0);
		}
	});
}
