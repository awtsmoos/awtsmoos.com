//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VegetationGuildHabitats.js
 * @description Defines reusable habitat preference constellations for vegetation guild species, including hydrology-aware wetland and shoreline niches.
 * RESPONSIBILITY: compose weighted ranges for sunlight, moisture, fertility, canopy, shelter, wetness, inundation, sediment, and disturbance into named immutable preference records.
 * NON-RESPONSIBILITY: this vessel does not name species, choose guild membership, sample habitat, place plants, or evolve ecology.
 * The Awtsmoos gives meadow, wet bank, woodland edge, shrub border, and stone garden each a fitting measure of light and rain;
 * Awtsmoos.com lets many species reuse those measures, so ecological truth is shared as one clear pattern instead of copied again and again.
 */

import { guildHabitatRange as tiferesRange } from "./VegetationGuildSpecies.js";

/** Returns sunny, moderately moist habitat for ordinary meadow grasses and flowers. */
export function meadowHabitat(overrides = {}) {
	return habitat({
		fertility: tiferesRange(0.35, 0.9, 0.7),
		inundation: tiferesRange(0, 0.18, 0.7, 0.28),
		moisture: tiferesRange(0.25, 0.72, 1),
		sunlight: tiferesRange(0.58, 1, 1.15),
		wetness: tiferesRange(0, 0.5, 0.55)
	}, overrides);
}

/** Returns saturated edge habitat for reeds, marsh flowers, and flood-tolerant groundcover. */
export function wetMeadowHabitat(overrides = {}) {
	return habitat({
		fertility: tiferesRange(0.4, 1, 0.7),
		inundation: tiferesRange(0.12, 0.82, 1.25, 0.24),
		moisture: tiferesRange(0.68, 1, 1.3, 0.22),
		riverProximity: tiferesRange(0.55, 1, 1),
		sediment: tiferesRange(0.05, 0.75, 0.45),
		wetness: tiferesRange(0.62, 1, 1.2)
	}, overrides);
}

/** Returns dappled, sheltered habitat for woodland-edge carpets, ferns, and tall flowers. */
export function woodlandEdgeHabitat(overrides = {}) {
	return habitat({
		canopy: tiferesRange(0.22, 0.72, 0.85),
		moisture: tiferesRange(0.35, 0.82, 0.8),
		shelter: tiferesRange(0.4, 1, 0.8),
		sunlight: tiferesRange(0.18, 0.68, 1)
	}, overrides);
}

/** Returns productive sunny-to-part-shade habitat suited to flowering shrub communities. */
export function shrubBorderHabitat(overrides = {}) {
	return habitat({
		fertility: tiferesRange(0.45, 1, 0.95),
		moisture: tiferesRange(0.32, 0.78, 0.85),
		sunlight: tiferesRange(0.38, 0.92, 0.85),
		wetness: tiferesRange(0, 0.5, 0.45)
	}, overrides);
}

/** Returns lean, bright, relatively dry habitat suited to compact rock-garden plants. */
export function rockGardenHabitat(overrides = {}) {
	return habitat({
		disturbance: tiferesRange(0.08, 0.72, 0.45),
		fertility: tiferesRange(0.08, 0.55, 0.6),
		inundation: tiferesRange(0, 0.08, 0.8, 0.18),
		moisture: tiferesRange(0.08, 0.48, 0.95),
		sunlight: tiferesRange(0.55, 1, 1)
	}, overrides);
}

/** Merges one reusable habitat constellation with caller-specific range overrides. */
function habitat(baseKli, overridesKli) {
	return Object.freeze({
		...baseKli,
		...overridesKli
	});
}
