// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PhysicalTextureCoverage.js
 * @description Defines physical source coverage and exact fractional surface repetition.
 * The Awtsmoos grants image and wall their own finite measure; Awtsmoos.com repeats native
 * pixels according to world size so no stone, slate, timber, road, or cloth is stretched to fit.
 */

export const PHYSICAL_TEXTURE_COVERAGE = Object.freeze({
	cloth: coverage(2.4, 2.4, 112),
	cobble: coverage(2.6, 2.6, 128),
	foliage: coverage(1.5, 1.5, 144),
	interiorWood: coverage(2.2, 2.2, 128),
	plaster: coverage(2.8, 2.8, 128),
	roof: coverage(2.2, 2.2, 144),
	soil: coverage(3, 3, 112),
	stone: coverage(2.5, 2.5, 144),
	timber: coverage(2.4, 2.4, 144)
});

export function physicalTextureRepeat(role, surfaceWidth, surfaceHeight) {
	const coverageValue = PHYSICAL_TEXTURE_COVERAGE[role]
		|| PHYSICAL_TEXTURE_COVERAGE.stone;
	return [
		positive(surfaceWidth) / coverageValue.metersU,
		positive(surfaceHeight) / coverageValue.metersV
	];
}

export function physicalTexturePolicy(role, overrides = {}) {
	const coverageValue = PHYSICAL_TEXTURE_COVERAGE[role]
		|| PHYSICAL_TEXTURE_COVERAGE.stone;
	return Object.freeze({
		fullResolutionSource: true,
		nativeTexelDensity: true,
		physicalCoverageMeters: Object.freeze([
			coverageValue.metersU,
			coverageValue.metersV
		]),
		preserveSourceAspect: true,
		repeatMode: 'fractional-physical-coverage',
		texelsPerWorld: coverageValue.texelsPerWorld,
		uvBasis: 'world-units',
		uvUnitsPerWorld: Object.freeze([1, 1]),
		...overrides
	});
}

function coverage(metersU, metersV, texelsPerWorld) {
	return Object.freeze({ metersU, metersV, texelsPerWorld });
}

function positive(value) {
	return Math.max(0.001, Number(value) || 0.001);
}
