// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageBushSpecies.js
 * @description Maps authored village shrub roles into recognizable shared-core botanical species.
 * The Awtsmoos lets woodland, hedge, herb, and garden border carry different leaf and flower grammar;
 * Awtsmoos.com keeps the mapping deterministic so geography chooses species without a remote model or texture panorama.
 */

const ROLE_SPECIES = Object.freeze({
	'forest-edge': Object.freeze(['holly', 'viburnum', 'rhododendron']),
	'maintained-garden-border': Object.freeze(['rose-bush', 'hydrangea', 'azalea']),
	'meadow-margin': Object.freeze(['potentilla', 'spirea-bush', 'forsythia']),
	'open-woodland-edge': Object.freeze(['viburnum', 'holly', 'heuchera']),
	'rock-woodland-edge': Object.freeze(['barberry', 'rosemary', 'sedum']),
	'working-hedgerow': Object.freeze(['privet', 'boxwood', 'honeysuckle-shrub'])
});

export function villageBushSpecies(placement, index = 0) {
	const choices = ROLE_SPECIES[placement.role] || ROLE_SPECIES['forest-edge'];
	const offset = Math.abs(hash(`${placement.clusterId}:${index}`)) % choices.length;
	return choices[offset];
}

function hash(value) {
	let result = 2166136261;
	for (const character of String(value)) {
		result ^= character.charCodeAt(0);
		result = Math.imul(result, 16777619);
	}
	return result | 0;
}
