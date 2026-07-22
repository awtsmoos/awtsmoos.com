// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every botanical family through one truthful doorway.
 * This Awtsmoos.com barrel merges legacy meshes, canonical skeletons, LODs,
 * trellis fields, reports, presets, reference species, and botany exactly once.
 */
export {
	TreeGenerator,
	generateTreeLods,
	generateTreeProceduralData,
	generateTreeSkeleton,
	getTreeCapabilities,
	getTreePreset,
	listTreePresets
} from "../core/geometry/generators/tree/treeGenerator.js";
export { TreeGrowthSystem } from "../core/geometry/generators/tree/treeGrowthSystem.js";
export { TreeGeometryBuilder } from "../core/geometry/generators/tree/treeGeometryBuilder.js";
export { TreeSkeletonGenerator } from "../core/geometry/generators/tree/treeSkeletonGenerator.js";
export {
	TreeSkeletonArtifact,
	hashTreeSkeleton
} from "../core/geometry/generators/tree/treeSkeletonArtifact.js";
export {
	TREE_LOD_PROFILES,
	createTreeLodSet
} from "../core/geometry/generators/tree/treeLodPlanner.js";
export { buildTreeGeometryFromSkeleton } from "../core/geometry/generators/tree/treeGeometryFromSkeleton.js";
export { validateTreeProceduralData } from "../core/geometry/generators/tree/treeValidation.js";
export {
	calculateTreeTrellisForce,
	createTreeTrellisReport,
	nearestTreeTrellisPoint,
	normalizeTreeTrellis
} from "../core/geometry/generators/tree/treeTrellisField.js";
export {
	DEFAULT_TREE_LOD_ORDER,
	TREE_DETAIL_PROFILES,
	listTreeDetailProfiles,
	normalizeTreeDetailProfile
} from "../core/geometry/generators/tree/treeDetailProfiles.js";
export {
	cloneTreeValue,
	mergeTreeConfig,
	resolveTreeConfig
} from "../core/geometry/generators/tree/treeConfigResolver.js";
export {
	TREE_MATERIAL_NEEDS,
	TREE_PRESET_ALIASES,
	TREE_PRESET_NAMES,
	TREE_PRESETS
} from "../core/geometry/generators/tree/treePresets.js";
export {
	REQUIRED_TREE_BARK_TYPES,
	REQUIRED_TREE_LEAF_TYPES,
	canonicalBarkType,
	canonicalLeafType
} from "../core/geometry/generators/tree/treeMaterialCatalog.js";
export {
	REFERENCE_TREE_MATERIAL_URLS,
	referenceTreeMaterialUrls
} from "../core/geometry/generators/tree/referenceTreeMaterials.js";
export {
	REFERENCE_TREE_SPECIES,
	generateReferenceTreeProceduralData,
	getReferenceTreeSpecies
} from "../core/geometry/generators/tree/referenceTreeSpecies.js";
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
export {
	planBotanicalFlowerOrgans
} from "../core/geometry/generators/botany/BotanicalFlowerOrgans.js";
export { validateBotanicalGeometry } from "../core/geometry/generators/botany/BotanicalValidation.js";
