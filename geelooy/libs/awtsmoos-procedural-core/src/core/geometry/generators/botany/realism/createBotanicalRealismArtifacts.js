// B"H
// Boruch Hashem
// Blessed is He
/** Mechanics, physiology, optics, roots, seasons, and reproduction remain derived. */

import { createBotanicalBiomechanics } from "./createBotanicalBiomechanics.js";
import { createBotanicalPhysiology } from "./createBotanicalPhysiology.js";
import { createBotanicalReproductiveProfile } from "./createBotanicalReproductiveProfile.js";
import { createBotanicalRootArchitecture } from "./createBotanicalRootArchitecture.js";
import { createBotanicalSeasonalProfile } from "./createBotanicalSeasonalProfile.js";
import { createBotanicalSurfaceProfiles } from "./createBotanicalSurfaceProfiles.js";

/** Compiles non-authoritative living artifacts around deterministic plant geometry. */
export function createBotanicalRealismArtifacts(plant, options = {}) {
	const physiology = createBotanicalPhysiology(plant, options.physiology);
	return Object.freeze({
		schema: "awtsmoos.botanical-realism-artifacts",
		sourceSpeciesId: plant.speciesId,
		sourceSeed: plant.seed,
		biomechanics: createBotanicalBiomechanics(plant, options.biomechanics),
		physiology,
		roots: createBotanicalRootArchitecture(plant, options.roots),
		season: createBotanicalSeasonalProfile(plant, physiology, options.season),
		surfaces: createBotanicalSurfaceProfiles(plant, options.surfaces),
		reproduction: createBotanicalReproductiveProfile(plant, options.reproduction),
		lodPolicy: Object.freeze({
			near: "full-geometry-roots-pollen-wind",
			middle: "instanced-organs-root-proxy-wind-modes",
			far: "impostor-with-physiology-and-season-signals",
			preserveSilhouette: true
		}),
		capabilities: Object.freeze([
			"wind-response",
			"growth-signals",
			"photosynthesis",
			"transpiration",
			"root-architecture",
			"seasonal-development",
			"pollen-emission",
			"thin-surface-optics"
		])
	});
}
