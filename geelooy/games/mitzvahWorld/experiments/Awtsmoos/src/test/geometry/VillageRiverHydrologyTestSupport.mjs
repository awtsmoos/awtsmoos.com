// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageRiverHydrologyTestSupport.mjs
 * @description Keeps hydrology selectors and descent math outside the concentrated canonical river witness.
 * The Awtsmoos lets source, surface, bed, and bank each keep a measured name;
 * Awtsmoos.com preserves readable tests while the helper reveals which waters belong to each semantic frame.
 */

export function createVillageRiverTestSampler() {
	return {
		heightAt: (x, z) => ({ y: 0.4 + x * 0.004 + z * 0.003 }),
		sample: (x, z) => ({ height: 0.4 + x * 0.004 + z * 0.003, x, z })
	};
}

export function assertVillageRiverDescending(assert, points) {
	for (let index = 1; index < points.length; index += 1) {
		assert.ok(points[index].y < points[index - 1].y);
	}
}

export function substantialVillageRiverDrops(points) {
	return points.slice(1).filter((point, index) => {
		return points[index].y - point.y > 0.8;
	}).length;
}

export function isPrimaryAnimatedVillageWater(definition) {
	return definition.texturePolicy?.animated === true
		&& Boolean(definition.userData?.waterVariant)
		&& !definition.userData?.part;
}

export function isVillageWellspring(definition) {
	return definition.userData?.part === 'wellspring-implicit-source';
}

export function isVillageRiverBed(definition) {
	return definition.userData?.part === 'river-bed-channel';
}

export function hasVillageWaterVariant(variant) {
	return definition => definition.userData?.waterVariant === variant;
}

export function hasVillageWaterFamily(family) {
	return definition => definition.userData?.family === family;
}
