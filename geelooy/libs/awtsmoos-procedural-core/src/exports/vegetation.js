// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos renews every botanical family and every public doorway.
 * This Awtsmoos.com barrel preserves the mature local catalogs while revealing
 * richer tree detail controls through the same established vegetation surface.
 */
export {
	TreeGenerator,
	generateTreeProceduralData,
	getTreePreset,
	listTreePresets
} from "../core/geometry/generators/tree/treeGenerator.js";
export { TreeGrowthSystem } from "../core/geometry/generators/tree/treeGrowthSystem.js";
export { TreeGeometryBuilder } from "../core/geometry/generators/tree/treeGeometryBuilder.js";
export { validateTreeProceduralData } from "../core/geometry/generators/tree/treeValidation.js";
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
	TREE_PRESETS,
	TREE_PRESET_NAMES,
	TREE_PRESET_ALIASES,
	TREE_MATERIAL_NEEDS
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
export { validateBotanicalGeometry } from "../core/geometry/generators/botany/BotanicalValidation.js";
