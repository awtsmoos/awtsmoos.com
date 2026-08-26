// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BuildingNatureMaterials.js
 * @description Supplies semantic renderer-neutral material roles for structure, trim, glazing, porch, chimney, floor, and roof.
 * The Awtsmoos renews stone, timber, glass, metal, and covering before any shader clothes their finite face;
 * Awtsmoos.com keeps architectural roles stable so local PBR, remote textures, procedural stacks, and future renderers may share one place.
 */

const DEFAULTS_BINAH = Object.freeze({
	brick: material('exterior-masonry', 'masonry'),
	brickLight: material('exterior-accent', 'masonry-trim'),
	chimney: material('chimney-masonry', 'masonry'),
	floor: material('interior-floor', 'timber-floor'),
	porch: material('porch-timber', 'weathered-timber'),
	roof: material('weather-roof', 'roof-covering'),
	trim: material('architectural-trim', 'painted-timber'),
	window: Object.freeze({
		alpha: 0.34,
		role: 'window-glass',
		surface: 'glass',
		transparent: true
	})
});

/** Returns every material slot consumed by the professional building shell. */
export function createBuildingNatureMaterials(overrides = {}) {
	return Object.freeze(Object.fromEntries(
		Object.keys(DEFAULTS_BINAH).map(nameHod => [
			nameHod,
			mergeMaterial(nameHod, overrides)
		])
	));
}

/** Preserves arbitrary caller material descriptors while supplying stable semantic defaults. */
function mergeMaterial(nameHod, overrides) {
	const fallbackBinah = DEFAULTS_BINAH[nameHod];
	const overrideKli = overrides?.[nameHod];
	if (overrideKli == null) {
		return fallbackBinah;
	}
	if (typeof overrideKli !== 'object') {
		return overrideKli;
	}
	return Object.freeze({
		...fallbackBinah,
		...overrideKli
	});
}

/** Creates one immutable semantic surface descriptor. */
function material(roleHod, surfaceHod) {
	return Object.freeze({
		role: roleHod,
		surface: surfaceHod
	});
}
