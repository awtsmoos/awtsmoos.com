//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WaterVegetationHabitatPreferences.js
 * @description Defines reusable water-driven habitat preference profiles for canonical vegetation guilds without owning species identity.
 * RESPONSIBILITY: express preferred ranges for saturated edges, moss/fern cover, meadow growth, flower drifts, shrubs, and vines.
 * NON-RESPONSIBILITY: this vessel does not place plants, name species, sample water, or create botanical geometry.
 * The Awtsmoos renews moisture, scour, meadow, bank, and hidden shade before a root receives its finite name;
 * Awtsmoos.com lets these Binah-like preference vessels shape many species honestly while keeping physical cause and botanical identity from becoming the same.
 */
import { guildHabitatRange } from './VegetationGuildSpecies.js';

/** Creates the saturated shoreline preference used by aquatic-edge flowers and carpets. */
export function saturatedEdgeHabitat() {
	return Object.freeze({
		deposition: guildHabitatRange(0.18, 1, 0.65, 0.3),
		saturatedMargin: guildHabitatRange(0.42, 1, 1.35, 0.35),
		scour: guildHabitatRange(0, 0.42, 1.15, 0.28),
		shallowShelf: guildHabitatRange(0.12, 0.92, 0.82, 0.35),
		waterEdge: guildHabitatRange(0.28, 1, 1.15, 0.32),
		wetness: guildHabitatRange(0.58, 1, 1.05, 0.32)
	});
}

/** Creates the damp low-disturbance preference used by mosses and ferns. */
export function mossFernHabitat() {
	return Object.freeze({
		deposition: guildHabitatRange(0.12, 1, 0.58, 0.4),
		disturbance: guildHabitatRange(0, 0.42, 0.9, 0.3),
		moisture: guildHabitatRange(0.55, 1, 1.2, 0.32),
		riparianBank: guildHabitatRange(0.2, 1, 0.72, 0.42),
		scour: guildHabitatRange(0, 0.28, 1.15, 0.24),
		wetness: guildHabitatRange(0.4, 1, 0.95, 0.35)
	});
}

/** Creates the broad moist-meadow preference used by grass and clover communities. */
export function moistMeadowHabitat() {
	return Object.freeze({
		inundation: guildHabitatRange(0, 0.2, 0.82, 0.2),
		moistMeadow: guildHabitatRange(0.35, 1, 1.35, 0.35),
		moisture: guildHabitatRange(0.34, 0.82, 1, 0.34),
		saturation: guildHabitatRange(0, 0.58, 0.65, 0.28),
		scour: guildHabitatRange(0, 0.25, 0.8, 0.2)
	});
}

/** Creates the patchy riparian flower preference between active bank and meadow. */
export function riparianFlowerHabitat() {
	return Object.freeze({
		moistMeadow: guildHabitatRange(0.22, 1, 0.82, 0.38),
		moisture: guildHabitatRange(0.4, 0.92, 1.15, 0.34),
		riparianBank: guildHabitatRange(0.18, 1, 0.72, 0.42),
		saturation: guildHabitatRange(0.08, 0.72, 0.58, 0.32),
		scour: guildHabitatRange(0, 0.35, 0.9, 0.24)
	});
}

/** Creates the stable moist-bank preference used by shrubs and bush islands. */
export function riparianShrubHabitat() {
	return Object.freeze({
		inundation: guildHabitatRange(0, 0.14, 1.2, 0.16),
		moisture: guildHabitatRange(0.42, 0.88, 1.05, 0.32),
		riparianBank: guildHabitatRange(0.32, 1, 1.35, 0.3),
		saturation: guildHabitatRange(0.08, 0.62, 0.7, 0.3),
		scour: guildHabitatRange(0, 0.2, 1.4, 0.16)
	});
}

/** Creates the moist non-submerged preference used by climbing vines near supports. */
export function moistVineHabitat() {
	return Object.freeze({
		inundation: guildHabitatRange(0, 0.1, 1.15, 0.16),
		moisture: guildHabitatRange(0.48, 1, 1.15, 0.32),
		riparianBank: guildHabitatRange(0.2, 1, 0.8, 0.4),
		scour: guildHabitatRange(0, 0.22, 1.1, 0.18),
		shelter: guildHabitatRange(0.35, 1, 0.72, 0.4)
	});
}
