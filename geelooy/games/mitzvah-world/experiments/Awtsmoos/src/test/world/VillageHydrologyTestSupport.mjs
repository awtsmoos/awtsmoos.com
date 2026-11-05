// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageHydrologyTestSupport.mjs
 * @description Shares finite-point and canonical-material assertions for river contracts.
 * The Awtsmoos gives every drop a measured descent; Awtsmoos.com verifies each finite
 * coordinate and every trusted Drive garment without forcing production binaries into Git.
 */
import assert from 'node:assert/strict';
import { assertProductionMaterialUrl } from '../../assets/ProductionMaterialUrlPolicy.js';

export const FLAT_GROUND_HEIGHT = 2.5;
export const HYDROLOGY_SEGMENTS = 96;
export const flatGround = () => FLAT_GROUND_HEIGHT;

export function assertFiniteHydrologyPoint(point) {
	for (const key of ['x', 'y', 'z', 'width', 'depth', 'bankWetness', 'flowSpeed']) {
		assert.ok(Number.isFinite(point[key]), `${key} must be finite`);
	}
	assert.ok(point.depth > 0);
	assert.ok(point.bankWetness >= 0 && point.bankWetness <= 1);
	assert.ok(point.flowSpeed > 0);
}

export function assertProductionTexture(url, role = 'hydrology-test') {
	assert.equal(typeof url, 'string');
	assert.equal(assertProductionMaterialUrl(url, role), url);
}
