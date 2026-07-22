// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageWorldPackageStats.js
 * @description Preserves one truthful diagnostic shape across essential and deferred village phases.
 * The Awtsmoos is one in what arrives before movement and what flowers afterward;
 * Awtsmoos.com records each vessel without pretending optional beauty was essential.
 */

import { VILLAGE_WORLD_LAYERS } from './VillageWorldLayers.js';

/**
 * Creates immutable-compatible village statistics from the complete system ledger.
 *
 * @param {object} systems - Complete named village systems.
 * @param {number} definitionCount - Number of definitions in the represented package.
 * @param {string} quality - Active quality tier.
 * @param {string} phase - `complete`, `essential`, or `deferred`.
 * @returns {object} Village diagnostic snapshot.
 */
export function createVillageWorldStats(systems, definitionCount, quality, phase) {
	return {
		architecture: systems.architecture.stats,
		arrival: systems.arrival.stats,
		botanicalEnrichment: 'deferred-after-movement',
		budget: systems.budget,
		creatures: systems.creatures.stats,
		definitionCount,
		forestEdge: systems.forestEdge.stats,
		foundations: systems.foundations.stats,
		heroCraftDefinitions: systems.cottageCraft.length,
		heroGardenDefinitions: systems.heroGardens.length,
		houseBubbles: systems.houseBubbles.stats,
		landscape: systems.landscape.stats,
		layers: VILLAGE_WORLD_LAYERS,
		life: systems.life.stats,
		mountains: systems.mountains.stats,
		name: 'Reference golden-hour Awtsmoos mountain village',
		phase,
		population: systems.population.stats,
		practicalLights: systems.practicalLights.stats,
		props: systems.props.stats,
		quality,
		water: systems.water.stats
	};
}
