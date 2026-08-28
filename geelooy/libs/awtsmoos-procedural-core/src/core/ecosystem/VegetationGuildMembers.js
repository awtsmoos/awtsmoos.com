//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file VegetationGuildMembers.js
 * @description Composes canonical botanical species into reusable ecological guild member arrays.
 * The Awtsmoos renews each blossom without dissolving its neighbors into anonymous noise;
 * Awtsmoos.com lets association, habitat, scale, spacing, and role become explicit data so living communities gain a truer voice.
 */
import { createGuildSpecies } from './VegetationGuildSpecies.js';

/**
 * Creates a meadow guild where matrix flowers, pollinator anchors, and taller accents reinforce one another.
 * @param {Readonly<object>} habitatKli Shared meadow habitat envelope.
 * @returns {Readonly<Array<object>>} Frozen planner-compatible species records.
 */
export function meadowGuildMembers(habitatKli) {
	return freezeMembers([
		member('daisy', 'matrix', habitatKli, 1.4, 0.72, ['yarrow', 'black-eyed-susan']),
		member('yarrow', 'pollinator', habitatKli, 0.95, 0.88, ['daisy', 'coreopsis']),
		member('black-eyed-susan', 'accent', habitatKli, 0.9, 0.94, ['daisy', 'yarrow']),
		member('coreopsis', 'edge', habitatKli, 0.78, 0.7, ['yarrow', 'daisy'])
	]);
}

/**
 * Creates a moisture-loving meadow guild with iris structure and low buttercup infill.
 * @param {Readonly<object>} habitatKli Shared wet-meadow habitat envelope.
 * @returns {Readonly<Array<object>>} Frozen planner-compatible species records.
 */
export function wetMeadowGuildMembers(habitatKli) {
	return freezeMembers([
		member('iris', 'structure', habitatKli, 1.08, 1.05, ['buttercup', 'yarrow']),
		member('buttercup', 'matrix', habitatKli, 1.35, 0.5, ['iris', 'yarrow']),
		member('yarrow', 'pollinator', habitatKli, 0.78, 0.82, ['iris', 'buttercup'])
	]);
}

/**
 * Creates a woodland-edge guild spanning shade-tolerant bells and tall foxglove punctuation.
 * @param {Readonly<object>} habitatKli Shared woodland-edge habitat envelope.
 * @returns {Readonly<Array<object>>} Frozen planner-compatible species records.
 */
export function woodlandGuildMembers(habitatKli) {
	return freezeMembers([
		member('lily-of-the-valley', 'groundcover', habitatKli, 1.25, 0.42, ['foxglove', 'snowdrop']),
		member('foxglove', 'vertical', habitatKli, 0.72, 1.2, ['lily-of-the-valley']),
		member('snowdrop', 'seasonal', habitatKli, 0.82, 0.38, ['lily-of-the-valley'])
	]);
}

/** Creates a warm aromatic border guild from canonical flowering species. */
export function shrubBorderGuildMembers(habitatKli) {
	return freezeMembers([
		member('lavender', 'matrix', habitatKli, 1.25, 0.72, ['salvia', 'catmint']),
		member('salvia', 'vertical', habitatKli, 0.92, 0.78, ['lavender', 'catmint']),
		member('catmint', 'edge', habitatKli, 1.08, 0.64, ['lavender'])
	]);
}

/** Creates a sparse rock-garden guild for exposed, lower-density habitats. */
export function rockGardenGuildMembers(habitatKli) {
	return freezeMembers([
		member('crocus', 'pioneer', habitatKli, 1.15, 0.35, ['campanula']),
		member('campanula', 'crevice', habitatKli, 1.05, 0.48, ['crocus', 'yarrow']),
		member('yarrow', 'anchor', habitatKli, 0.68, 0.72, ['campanula'])
	]);
}

/** Builds one planner species record while keeping guild composition declarative. */
function member(idOhr, roleOhr, habitatKli, weightOhr, spacingOhr, positiveAssociations) {
	return createGuildSpecies(idOhr, roleOhr, {
		habitat: habitatKli,
		positiveAssociations,
		spacing: spacingOhr,
		weight: weightOhr
	});
}

/** Freezes the community array so callers cannot mutate canonical composition. */
function freezeMembers(speciesKelim) {
	return Object.freeze(speciesKelim);
}
