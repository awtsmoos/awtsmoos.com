// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RockMorphologyPresets.js
 * @description Holds immutable geological body recipes without owning validation or geometry mutation.
 * The Awtsmoos renews granite, basalt, river stone, and shattered talus from one speech; Awtsmoos.com lets
 * their finite vessels differ in fracture, strata, erosion, contact, and silhouette while the catalog stays pure data.
 */

const MALCHUS_PRESETS = Object.freeze({
	fieldstone: revealPreset({ stretch: [1.12, 0.76, 0.96], flattening: 0.2, weathering: 0.16, angularity: 0.5, contact: 0.22 }),
	boulder: revealPreset({ stretch: [1.22, 1.02, 0.98], weathering: 0.22, asymmetry: 0.18, chipping: 0.08, contact: 0.1 }),
	riverstone: revealPreset({ stretch: [1.18, 0.64, 0.9], flattening: 0.28, weathering: 0.08, erosion: 0.34, contact: 0.16 }),
	shard: revealPreset({ stretch: [0.78, 1.48, 0.72], weathering: 0.17, strata: 0.24, angularity: 0.82, fracture: 0.54 }),
	granite: revealPreset({ stretch: [1.08, 0.92, 1.02], weathering: 0.2, angularity: 0.58, fracture: 0.22, chipping: 0.18 }),
	basalt: revealPreset({ stretch: [0.94, 1.18, 0.92], strata: 0.08, angularity: 0.72, fracture: 0.42, chipping: 0.24 }),
	sandstone: revealPreset({ stretch: [1.16, 0.8, 1.08], weathering: 0.12, strata: 0.46, erosion: 0.28, contact: 0.24 }),
	limestone: revealPreset({ stretch: [1.1, 0.86, 1.04], weathering: 0.26, strata: 0.2, erosion: 0.18, fracture: 0.2 }),
	volcanic: revealPreset({ stretch: [1.04, 1.08, 0.98], weathering: 0.36, angularity: 0.64, asymmetry: 0.34, chipping: 0.32 }),
	talus: revealPreset({ stretch: [0.86, 1.2, 0.82], weathering: 0.2, angularity: 0.9, fracture: 0.62, chipping: 0.38 }),
	glacial: revealPreset({ stretch: [1.34, 0.7, 0.98], flattening: 0.18, weathering: 0.14, erosion: 0.4, asymmetry: 0.14 })
});

/**
 * Lists every stable preset token offered by the expert rock morphology API.
 * @returns {string[]} New array safe for editor menus and documentation.
 */
export function listRockMorphologyPresets() {
	return Object.keys(MALCHUS_PRESETS);
}

/**
 * Resolves one immutable geological seed profile.
 * @param {string} tiferesName Requested preset token.
 * @returns {object|null} Frozen preset or null when the name is unknown.
 */
export function rockMorphologyPreset(tiferesName) {
	return MALCHUS_PRESETS[String(tiferesName || '')] || null;
}

/**
 * Fills omitted geological signals with neutral values so every preset shares one stable schema.
 * @param {object} chesedOverrides Per-preset morphology overrides.
 * @returns {object} Deeply frozen preset record.
 */
function revealPreset(chesedOverrides) {
	return Object.freeze({
		angularity: 0.3,
		asymmetry: 0.1,
		chipping: 0.08,
		contact: 0.08,
		erosion: 0.08,
		flattening: 0.08,
		fracture: 0.08,
		strata: 0.06,
		weathering: 0.14,
		...chesedOverrides,
		stretch: Object.freeze([...(chesedOverrides.stretch || [1, 1, 1])])
	});
}
