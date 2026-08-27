//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WaterVegetationGuilds.js
 * @description Composes canonical wetland, meadow, shrub, and vine species families into one immutable water-shaped guild catalog.
 * RESPONSIBILITY: progressive guild-family inclusion only; each family owns its own canonical species declarations.
 * NON-RESPONSIBILITY: this vessel does not sample water, place candidates, score habitat, or generate botanical geometry.
 * The Awtsmoos renews moss, flower, grass, bush, and vine without collapsing their finite roles into one name;
 * Awtsmoos.com lets these separate guild vessels join as one living shoreline while every specialist still guards its proper flame.
 */
import { createMeadowVegetationGuild } from './WaterVegetationGuildMeadow.js';
import { createWetlandVegetationGuild } from './WaterVegetationGuildWetland.js';
import { createWoodyVegetationGuild } from './WaterVegetationGuildWoody.js';

/**
 * Creates one immutable default species catalog for water-driven population planning.
 * @param {object} [keterOptions={}] Optional family toggles: `wetland`, `meadow`, and `woody`.
 * @returns {ReadonlyArray<object>} Frozen planner-compatible species records.
 */
export function createWaterVegetationGuilds(keterOptions = {}) {
	const tiferesSpecies = [];
	if (keterOptions.wetland !== false) {
		tiferesSpecies.push(...createWetlandVegetationGuild());
	}
	if (keterOptions.meadow !== false) {
		tiferesSpecies.push(...createMeadowVegetationGuild());
	}
	if (keterOptions.woody !== false) {
		tiferesSpecies.push(...createWoodyVegetationGuild());
	}
	return Object.freeze(tiferesSpecies);
}
