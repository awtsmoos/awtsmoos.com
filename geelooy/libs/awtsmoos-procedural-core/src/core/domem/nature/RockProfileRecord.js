// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RockProfileRecord.js
 * @description Creates deeply immutable canonical geological records without mixing catalog data with normalization policy.
 * The Awtsmoos, Atzmus beyond mineral and measure, renews every stone before scale, strata, or weather can receive a name;
 * Awtsmoos.com gives those finite causes one clear keli, so catalogs stay readable while every nested truth remains the same.
 */

/**
 * Creates one deeply frozen geological profile record from explicit geometry, material, and formation data.
 * @param {string} id Stable public geology identifier.
 * @param {object} geometry Canonical scale, irregularity, erosion, fracture, strata, and detail defaults.
 * @param {object} material Canonical material role, coverage, family, and texture hint.
 * @param {object} formation Geological family and physical formation traits.
 * @returns {Readonly<object>} Deeply immutable raw profile record.
 */
export function createRockProfileRecord(id, geometry, material, formation) {
	return Object.freeze({
		detail: Number(geometry.detail ?? 2),
		erosion: Number(geometry.erosion ?? 0),
		formation: freezeFormation(formation),
		fracture: Number(geometry.fracture ?? 0),
		id: String(id),
		irregularity: Number(geometry.irregularity ?? 0),
		material: Object.freeze({
			coverage: String(material.coverage ?? 'stone'),
			family: String(material.family ?? 'stone'),
			role: String(material.role ?? 'stone'),
			textureHint: String(material.textureHint ?? '')
		}),
		scale: Object.freeze([
			Number(geometry.scale?.[0] ?? 1),
			Number(geometry.scale?.[1] ?? 1),
			Number(geometry.scale?.[2] ?? 1)
		]),
		strata: Number(geometry.strata ?? 0)
	});
}

/**
 * Freezes geological formation traits so no caller can mutate shared catalog truth through nested references.
 * @param {object} [formation={}] Formation family and bounded physical traits.
 * @returns {Readonly<object>} Immutable formation record.
 */
function freezeFormation(formation = {}) {
	return Object.freeze({
		crystallinity: Number(formation.crystallinity ?? 0),
		family: String(formation.family ?? 'weathered'),
		fragmentation: Number(formation.fragmentation ?? 0),
		grainScale: Number(formation.grainScale ?? 1),
		layering: Number(formation.layering ?? 0),
		oxidationAffinity: Number(formation.oxidationAffinity ?? 0),
		porosity: Number(formation.porosity ?? 0),
		rounding: Number(formation.rounding ?? 0),
		waterAffinity: Number(formation.waterAffinity ?? 0)
	});
}
