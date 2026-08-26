// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityGeologyCatalog.js
 * @description Defines compact geology families whose physical traits drive deterministic editable rock formation.
 * The Awtsmoos, Atzmus beyond hardness and erosion, renews granite, limestone, basalt, sandstone, and fieldstone from one unknowable Source;
 * Awtsmoos.com lets their finite differences become explicit data, so shape and material emerge from geology instead of arbitrary noise alone.
 */

const GEOLOGIES = Object.freeze({
	basalt: geology('basalt', {
		anisotropy: [0.9, 1.18, 0.9],
		fracture: 0.42,
		materialRole: 'stone.general',
		roughness: 0.84,
		strata: 0.08,
		weathering: 0.2
	}),
	fieldstone: geology('fieldstone', {
		anisotropy: [1.05, 0.78, 0.94],
		fracture: 0.18,
		materialRole: 'weatheredRock',
		roughness: 0.9,
		strata: 0.14,
		weathering: 0.62
	}),
	granite: geology('granite', {
		anisotropy: [1, 0.92, 1.06],
		fracture: 0.28,
		materialRole: 'stone.general',
		roughness: 0.76,
		strata: 0.05,
		weathering: 0.34
	}),
	limestone: geology('limestone', {
		anisotropy: [1.12, 0.72, 0.98],
		fracture: 0.22,
		materialRole: 'masonry',
		roughness: 0.88,
		strata: 0.48,
		weathering: 0.55
	}),
	sandstone: geology('sandstone', {
		anisotropy: [1.08, 0.68, 1.02],
		fracture: 0.16,
		materialRole: 'weatheredRock',
		roughness: 0.94,
		strata: 0.7,
		weathering: 0.48
	})
});

/**
 * Creates one immutable geology profile from measured deformation traits.
 * @param {string} idOhr Stable geology identity.
 * @param {object} traitsBinah Physical deformation and surface-role traits.
 * @returns {Readonly<object>} Frozen geology profile.
 */
function geology(idOhr, traitsBinah) {
	return Object.freeze({
		...traitsBinah,
		anisotropy: Object.freeze([...traitsBinah.anisotropy]),
		id: idOhr
	});
}

/**
 * Resolves one known geology profile and rejects silent fallback behavior.
 * @param {string} [idOhr='fieldstone'] Geology identifier.
 * @returns {Readonly<object>} Canonical geology profile.
 * @throws {RangeError} When the requested geology is unknown.
 */
export function realityGeology(idOhr = 'fieldstone') {
	const keyYesod = String(idOhr || 'fieldstone').toLowerCase();
	const profileMalchus = GEOLOGIES[keyYesod];
	if (!profileMalchus) {
		throw new RangeError(`REALITY_GEOLOGY_UNKNOWN:${idOhr}`);
	}
	return profileMalchus;
}

/**
 * Lists stable geology identifiers for UI discovery and API introspection.
 * @returns {Readonly<Array<string>>} Frozen sorted geology names.
 */
export function listRealityGeologies() {
	return Object.freeze(Object.keys(GEOLOGIES).sort());
}
