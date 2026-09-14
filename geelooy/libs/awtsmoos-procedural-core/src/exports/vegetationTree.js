//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file vegetationTree.js
 * @description Public renderer-neutral tree authority exports: canonical skeletons, geometry, LODs, wind, materials, presets, and validation.
 * This module deliberately exposes data and algorithms rather than renderer objects so every consumer shares one botanical truth.
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
	createTreeWindRig,
	sampleTreeWindRig
} from "../core/geometry/generators/tree/treeWindDynamics.js";

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
	TREE_RUNTIME_PROFILES,
	applyTreeRuntimeProfile,
	listTreeRuntimeProfiles,
	treeRuntimeProfile
} from "../core/geometry/generators/tree/treeRuntimeProfile.js";

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
