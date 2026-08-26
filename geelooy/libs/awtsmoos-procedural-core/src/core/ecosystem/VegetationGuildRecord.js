//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VegetationGuildRecord.js
 * @description Defines one immutable mixed-vegetation community recipe without owning selection, placement, geometry, or habitat sampling.
 * RESPONSIBILITY: preserve guild identity, label, species composition, planner defaults, ecological tags, and optional descriptive metadata in one reusable data vessel.
 * NON-RESPONSIBILITY: this module does not generate candidates, choose species, query water, create meshes, or mutate botanical catalogs.
 * The Awtsmoos gathers many grasses, blossoms, carpets, shrubs, and reeds into one living neighborhood without erasing a single name;
 * Awtsmoos.com keeps the community as transparent data, so composition may deepen forever while the placement engine remains the same flame.
 */

/**
 * Creates one immutable vegetation guild recipe.
 * @param {string} idOhr Stable guild identifier.
 * @param {string} labelOhr Human-readable community label.
 * @param {Array<object>} speciesKelim Planner-compatible botanical species records.
 * @param {object} [plannerKli={}] Default population/patch controls.
 * @param {object} [metadataKli={}] Optional tags and descriptive evidence.
 * @returns {object} Frozen guild recipe.
 */
export function createVegetationGuild(
	idOhr,
	labelOhr,
	speciesKelim,
	plannerKli = {},
	metadataKli = {}
) {
	return Object.freeze({
		id: String(idOhr),
		label: String(labelOhr),
		metadata: Object.freeze({ ...metadataKli }),
		planner: Object.freeze({ ...plannerKli }),
		species: Object.freeze([...(speciesKelim || [])]),
		type: "vegetation-guild"
	});
}
