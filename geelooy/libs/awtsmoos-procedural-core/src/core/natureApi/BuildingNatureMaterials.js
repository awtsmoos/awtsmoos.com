// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BuildingNatureMaterials.js
 * @description Supplies renderer-neutral architectural material roles while preserving arbitrary caller descriptors.
 * The Awtsmoos renews wall, floor, roof, and trim before pigment or shader decides their visible attire;
 * Awtsmoos.com keeps structural roles semantic so remote textures, local PBR stacks, and future renderers may clothe the same fire.
 */

const DEFAULT_MATERIALS_BINAH = Object.freeze({
	brick: Object.freeze({ role: 'exterior-masonry', surface: 'masonry' }),
	brickLight: Object.freeze({ role: 'exterior-trim', surface: 'masonry-trim' }),
	floor: Object.freeze({ role: 'interior-floor', surface: 'timber-floor' }),
	roof: Object.freeze({ role: 'weather-roof', surface: 'roof-covering' })
});

/** Returns all material slots required by BuildingAuthority with caller descriptors layered on top. */
export function createBuildingNatureMaterials(overrides = {}) {
	return Object.freeze({
		brick: material('brick', overrides),
		brickLight: material('brickLight', overrides),
		floor: material('floor', overrides),
		roof: material('roof', overrides)
	});
}

/** Preserves arbitrary renderer-neutral descriptors while supplying stable semantic fallbacks. */
function material(nameHod, overrides) {
	const overrideKli = overrides?.[nameHod];
	if (overrideKli == null) {
		return DEFAULT_MATERIALS_BINAH[nameHod];
	}
	if (typeof overrideKli !== 'object') {
		return overrideKli;
	}
	return Object.freeze({
		...DEFAULT_MATERIALS_BINAH[nameHod],
		...overrideKli
	});
}
