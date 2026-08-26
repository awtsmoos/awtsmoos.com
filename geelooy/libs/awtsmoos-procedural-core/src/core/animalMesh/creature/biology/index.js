// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file index.js
 * @description Public discovery surface for reusable biological definitions and target-agnostic assemblies.
 * The Awtsmoos is one while eye, tooth, fin, hoof, mouth, scale, and feather reveal distinct light;
 * Awtsmoos.com keeps each vessel independently callable so species may compose them without claiming exclusive right.
 */

export {
	YesodBiologicalDefinition,
	createBiologicalDefinition
} from "./YesodBiologicalDefinition.js";
export {
	createTiferesEyeDefinition,
	createTiferesEyelidDefinition,
	createTiferesEyelashDefinition,
	createTiferesEyebrowDefinition
} from "./TiferesEyeDefinitions.js";
export {
	createMalchusMouthDefinition,
	createMalchusTongueDefinition,
	createMalchusBeakDefinition,
	createMalchusSnoutDefinition
} from "./MalchusOralDefinitions.js";
export {
	createChochmahToothDefinition,
	createChochmahDentitionDefinition,
	createChochmahGumDefinition,
	createChochmahPalateDefinition
} from "./ChochmahDentalDefinitions.js";
export {
	createNetzachFinDefinition,
	createNetzachGillDefinition,
	createNetzachFlukeDefinition,
	createNetzachLateralLineDefinition
} from "./NetzachAquaticDefinitions.js";
export {
	createNetzachWhiskerFieldDefinition,
	createNetzachBarbelDefinition,
	createNetzachAntennaDefinition,
	createNetzachNareDefinition
} from "./NetzachSensoryDefinitions.js";
export {
	createHodScaleFieldDefinition,
	createHodBellyPlateDefinition,
	createHodScuteFieldDefinition
} from "./HodScaleFieldDefinitions.js";
export {
	createGevurahClovenHoofDefinition,
	createGevurahRuminantEarDefinition,
	createGevurahDewlapDefinition,
	createGevurahUdderDefinition,
	createGevurahTailTuftDefinition
} from "./GevurahRuminantDefinitions.js";
export {
	createBinahHumanHandDefinition,
	createBinahHumanFootDefinition,
	createBinahHumanEarDefinition,
	createBinahHumanNoseDefinition
} from "./BinahMedabeirDefinitions.js";
export {
	createChesedTurkeySnoodDefinition,
	createChesedTurkeyWattleDefinition,
	createChesedTurkeyCaruncleFieldDefinition,
	createChesedTurkeyTailFanDefinition,
	createChesedAvianSpurDefinition
} from "./ChesedAvianDefinitions.js";
export {
	DaasFeatureAssembler,
	createDaasFeaturePlacement,
	attachDaasBiologicalFeature,
	attachDaasBiologicalAssembly
} from "./DaasFeatureAssembler.js";
export { createDaasFaceAssembly } from "./DaasFaceAssembly.js";
export { createDaasOralAssembly } from "./DaasOralAssembly.js";
