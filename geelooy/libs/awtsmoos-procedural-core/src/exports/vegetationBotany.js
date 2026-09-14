//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file vegetationBotany.js
 * @description Public renderer-neutral botanical exports for archetypes, species, phyllotaxis, flowers, vascular transport, realism, and validation.
 * General plant generation remains distinct from tree-specific authority while both share the same Procedural Core data-first architecture.
 */

export {
	BOTANICAL_ARCHETYPES,
	BOTANICAL_QUALITY,
	botanicalQuality
} from "../core/geometry/generators/botany/BotanicalArchetypes.js";

export {
	BOTANICAL_SPECIES,
	botanicalSpeciesFamilies,
	getBotanicalSpecies,
	listBotanicalSpecies,
	searchBotanicalSpecies
} from "../core/geometry/generators/botany/BotanicalSpeciesCatalog.js";

export {
	generateBotanicalCluster,
	generateBotanicalPlant
} from "../core/geometry/generators/botany/BotanicalGenerator.js";

export {
	generateRealisticBotanicalCluster,
	generateRealisticBotanicalPlant
} from "../core/geometry/generators/botany/BotanicalRealism.js";

export {
	BOTANICAL_GOLDEN_ANGLE,
	createBotanicalPhyllotaxis
} from "../core/geometry/generators/botany/BotanicalPhyllotaxis.js";

export { planBotanicalFlowerOrgans } from "../core/geometry/generators/botany/BotanicalFlowerOrgans.js";

export {
	createBotanicalVascularState,
	stepBotanicalVascularTransport,
	createBotanicalEnvironmentCoupling
} from "../core/geometry/generators/botany/realism/index.js";

export { validateBotanicalGeometry } from "../core/geometry/generators/botany/BotanicalValidation.js";
