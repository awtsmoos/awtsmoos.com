// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file index.js
 * @description Stable Nature export surface joining direct creation, path-aware capability discovery, orchestration, water, botany, matter, and generated materials.
 * The Awtsmoos renews every exported name before import paths divide their light; Awtsmoos.com gathers simple doors and expert
 * keilim so creature, forest, water, matter, discovery, recipes, batches, and remote texture generation remain ordered without one crowded gate.
 */

export { NatureApi, createNatureApi } from './NatureApi.js';
export { NatureApiBase } from './NatureApiBase.js';
export { NatureDirectApi } from './NatureDirectApi.js';
export { NatureCatalogApi } from './NatureCatalogApi.js';
export { NatureCapabilityApi, createNatureCapabilityApi } from './capabilities/NatureCapabilityApi.js';
export { createNatureCapabilityRecord } from './capabilities/NatureCapabilityRecord.js';
export {
	createNatureCapabilityInput,
	listNatureCapabilityInputTypes
} from './capabilities/NatureCapabilityInput.js';
export {
	NATURE_CAPABILITY_DOMAINS,
	listNatureCapabilityDomains
} from './capabilities/NatureCapabilityDomains.js';
export {
	listNatureCapabilityRecords,
	natureCapabilityRecordById,
	natureCapabilityRecordByMethod,
	natureCapabilityRecordByPath
} from './capabilities/NatureCapabilityRegistry.js';
export {
	filterNatureCapabilityRecords,
	searchNatureCapabilityRecords
} from './capabilities/NatureCapabilityQuery.js';
export {
	createNatureProviderEvidence,
	isNatureCapabilityAvailable
} from './capabilities/NatureCapabilityAvailability.js';
export { CreatureNatureApi } from './CreatureNatureApi.js';
export { VegetationNatureApi } from './VegetationNatureApi.js';
export { ForestNatureApi } from './ForestNatureApi.js';
export { WaterNatureApi } from './WaterNatureApi.js';
export { EcosystemNatureApi } from './EcosystemNatureApi.js';
export { RockNatureApi } from './RockNatureApi.js';
export { MaterialNatureApi } from './MaterialNatureApi.js';
export { SurfaceNatureApi } from './SurfaceNatureApi.js';
export { createNatureSurfacePlan } from './NatureSurfacePlan.js';
export { YesodWaterBodyRecipe, createWaterBodyRecipe } from './WaterBodyRecipe.js';
export { MalchusWaterBodyRuntime, createWaterBodyRuntime } from './WaterBodyRuntime.js';
export { TiferesWaterEcologySample, createWaterEcologySample } from '../ecosystem/WaterEcologySample.js';
export {
	YesodFluidInteractionSample,
	createFluidInteractionSample,
	fromFluidChannelSample,
	fromOceanWaveSample,
	fromShallowWaterSample
} from '../physics/fluid/FluidInteractionSample.js';
export { planBotanicalCluster } from '../geometry/generators/botany/BotanicalGenerator.js';
export {
	createTextureGenerationRequest,
	stableTextureGenerationKey,
	TextureGenerationGateway,
	TextureGenerationProvider,
	FunctionTextureGenerationProvider,
	ObjectTextureGenerationProvider
} from '../materials/generation/index.js';
export {
	createDefaultNatureOperationRegistry,
	defaultNatureOperationDefinitions,
	createNatureCapabilityReport,
	NetzachNatureBatchExecutor,
	NatureOperationRegistry,
	normalizeNatureOperationDefinition,
	normalizeNatureOperationKind,
	createNatureRecipe,
	YesodNatureRecipe,
	isNatureRecipeSerializable,
	parseNatureRecipe,
	serializeNatureRecipe,
	TiferesNatureRecipeExecutor
} from './orchestration/index.js';
export {
	NATURE_QUALITY_LEVELS,
	NATURE_REALISM_LEVELS,
	natureQualityScale,
	normalizeNatureProfile,
	specialistNatureQuality
} from './NatureApiProfiles.js';
export {
	defaultNatureSeedLabel,
	deriveNatureSeed,
	normalizeNatureSeed
} from './NatureApiSeed.js';
export {
	createNatureOperationContext,
	createNatureResult,
	unwrapNatureResult
} from './NatureApiResult.js';
