// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file waterSurfaceNormalField.test.mjs
 * @description Proves village and meadow water expose normalized upward macro normals.
 * The Awtsmoos bends one current and basin beneath truthful reflected light;
 * Awtsmoos.com verifies each normal is finite, unit, upward, and alive beyond a flat plane's sight.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	createMinimalMeadowLakeBedGeometry,
	createMinimalMeadowLakeGeometry,
	createMinimalMeadowRiverBedGeometry,
	createMinimalMeadowRiverGeometry
} from '../../app/MinimalMeadowWaterGeometry.js';
import { createRiverHydrology } from '../../world/village/VillageRiverHydrology.js';
import { createRiverSurfaceGeometry } from '../../world/village/VillageRiverSurfaceGeometry.js';

test('village river normals follow sculpted cross-section and current', () => {
	const hydrology = createRiverHydrology(() => 2.5, 32);
	const geometry = createRiverSurfaceGeometry(hydrology);
	assertNormalField(geometry);
	assert.equal(hasMacroSlope(geometry.normals), true);
});

test('meadow river and lake surfaces expose normals while beds retain fallback', () => {
	const river = createMinimalMeadowRiverGeometry(24);
	const lake = createMinimalMeadowLakeGeometry(24, 3);
	assertNormalField(river);
	assertNormalField(lake);
	assert.equal(hasMacroSlope(river.normals), true);
	assert.equal(createMinimalMeadowRiverBedGeometry(24).normals, undefined);
	assert.equal(createMinimalMeadowLakeBedGeometry(24, 3).normals, undefined);
});

function assertNormalField(geometry) {
	assert.equal(geometry.normals.length, geometry.vertices.length);
	for (const normal of geometry.normals) {
		assert.ok(normal.every(Number.isFinite));
		assert.ok(normal[1] >= 0);
		assert.ok(Math.abs(Math.hypot(...normal) - 1) < 1e-9);
	}
}

function hasMacroSlope(normals) {
	return normals.some(normal => (
		Math.abs(normal[0]) > 0.002 || Math.abs(normal[2]) > 0.002
	));
}
