// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowHouseCollisionDepth.test.mjs
 * @description Proves collision parity and separates exposed foundation/floor planes.
 * The Awtsmoos keeps visible vessel and resisting vessel in one measure; Awtsmoos.com
 * rejects invisible barriers and coplanar exposed tops without moving the terrain.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MINIMAL_MEADOW_HOUSE_PROFILES } from '../../app/MinimalMeadowHouseProfiles.js';
import {
	buildMinimalMeadowHouseFixture,
	colliderBounds,
	geometryBounds
} from './MinimalMeadowHouseTestFixture.mjs';

const EPSILON = 1e-5;
for (const profile of MINIMAL_MEADOW_HOUSE_PROFILES) {
	test(`${profile.id} collision bounds match every visible solid`, () => {
		const fixture = buildMinimalMeadowHouseFixture(profile);
		for (let index = 0; index < fixture.definitions.length; index += 1) {
			const definition = fixture.definitions[index];
			if (definition.solid === false) continue;
			const visible = geometryBounds(fixture.meshes[index]);
			const collision = colliderBounds(definition);
			for (let axis = 0; axis < 3; axis += 1) {
				assert.ok(Math.abs(visible.min[axis] - collision.min[axis]) < EPSILON);
				assert.ok(Math.abs(visible.max[axis] - collision.max[axis]) < EPSILON);
			}
		}
	});

	test(`${profile.id} exposes separated terrain, foundation, and floor tops`, () => {
		const fixture = buildMinimalMeadowHouseFixture(profile);
		const platform = fixture.definitions.find(definition => definition.id.endsWith('foundation-platform'));
		const floor = fixture.definitions.find(definition => definition.id.endsWith('ground-floor'));
		const platformTop = platform.position.y + platform.size.y / 2;
		const floorTop = floor.position.y + floor.size.y / 2;
		assert.ok(platformTop - fixture.foundation.evidence.terrainMaximum > 0.17);
		assert.ok(floorTop - platformTop > profile.floorThickness - EPSILON);
		assert.equal(platform.doubleSided, false);
		assert.equal(floor.doubleSided, false);
	});
}
