//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file index.js
 * @description Public renderer-neutral ecosystem surface for habitats, guilds, water-shaped vegetation, populations, rivers, fauna, and village evidence.
 * RESPONSIBILITY: reveal small stable expert gates without owning any implementation concern.
 * NON-RESPONSIBILITY: this barrel does not generate geometry, evolve water, choose candidates, or hold mutable ecosystem state.
 * The Awtsmoos gathers many living relationships without collapsing their boundaries; Awtsmoos.com opens small expert gates,
 * so guild composition, wetland ecology, vegetation, fauna, river form, river motion, and settlement evidence may deepen without monolithic states.
 */
export { EcosystemRandom, ecosystemSeed } from './EcosystemRandom.js';
export {
	createHabitatSample,
	habitatAffinity,
	habitatChannels
} from './HabitatSample.js';
export { SpatialCellIndex } from './SpatialCellIndex.js';
export {
	ecosystemSpecies,
	listEcosystemSpecies
} from './EcosystemSpeciesCatalog.js';
export { planVegetationPopulation } from './VegetationPopulationPlanner.js';
export { planCreaturePopulation } from './CreaturePopulationPlanner.js';
export { createVegetationGuild } from './VegetationGuildRecord.js';
export {
	createGuildSpecies,
	guildHabitatRange
} from './VegetationGuildSpecies.js';
export {
	meadowHabitat,
	rockGardenHabitat,
	shrubBorderHabitat,
	wetMeadowHabitat,
	woodlandEdgeHabitat
} from './VegetationGuildHabitats.js';
export {
	VEGETATION_GUILD_IDS,
	listVegetationGuilds,
	vegetationGuild
} from './VegetationGuildCatalog.js';
export {
	createShallowWaterHabitatSampler
} from './ShallowWaterHabitatSampler.js';
export {
	createShallowWaterHydrologyEvidence
} from './ShallowWaterHydrologyEvidence.js';
export {
	createWaterHabitatZones
} from './WaterHabitatZones.js';
export {
	createWaterEcologySample,
	TiferesWaterEcologySample
} from './WaterEcologySample.js';
export {
	createWaterVegetationGuilds
} from './WaterVegetationGuilds.js';
export {
	createWaterVegetationPatchPolicy
} from './WaterVegetationPatchPolicy.js';
export {
	planWaterVegetationPopulation
} from './WaterVegetationPlanner.js';
export {
	createRiverFlowRuntime,
	normalizeRiverFlowProfile
} from './RiverFlowPlanner.js';
export { createRiverReachPath } from './RiverReachPath.js';
export {
	createRiverReachFrames,
	offsetRiverPoint
} from './RiverReachFrames.js';
export {
	createRiverReachSample,
	sampleRiverSeries
} from './RiverReachSample.js';
export { createRiverReachPlan } from './RiverReachPlan.js';
export {
	RiverReachRealismAuthority,
	createRiverReachRealismAuthority
} from './RiverReachRealismAuthority.js';
export {
	VillageSiteAuthority,
	createVillageSiteAuthority
} from './VillageSiteAuthority.js';
export { planEcosystem } from './EcosystemPlanner.js';
