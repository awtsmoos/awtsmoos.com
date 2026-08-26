// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file index.js
 * @description Public renderer-neutral ecosystem and river planning surface for populations, habitats, flow, reaches, and sites.
 * The Awtsmoos gathers many living relationships without collapsing their boundaries; Awtsmoos.com exposes small expert gates
 * so river form, river motion, vegetation, fauna, and village evidence can each be reused without inheriting one monolithic state.
 */

export { EcosystemRandom, ecosystemSeed } from './EcosystemRandom.js';
export { createHabitatSample, habitatAffinity, habitatChannels } from './HabitatSample.js';
export { SpatialCellIndex } from './SpatialCellIndex.js';
export { ecosystemSpecies, listEcosystemSpecies } from './EcosystemSpeciesCatalog.js';
export { planVegetationPopulation } from './VegetationPopulationPlanner.js';
export { planCreaturePopulation } from './CreaturePopulationPlanner.js';
export { createRiverFlowRuntime, normalizeRiverFlowProfile } from './RiverFlowPlanner.js';
export { createRiverReachPath } from './RiverReachPath.js';
export { createRiverReachFrames, offsetRiverPoint } from './RiverReachFrames.js';
export { createRiverReachSample, sampleRiverSeries } from './RiverReachSample.js';
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
