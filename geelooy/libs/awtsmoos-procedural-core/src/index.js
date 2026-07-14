// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file index.js
 * @description Production doorway into the Awtsmoos procedural core. Geometry,
 * trees, people, gardens, and now inspectable text recipes emerge as distinct
 * vessels from one coherent API, renewed in order by the Awtsmoos.
 */
export { generateProceduralGeometry } from './core/geometry/geometryGenerator.js';
export { routePrimitive } from './core/geometry/generators/primitiveRouter.js';
export { processModifiers } from './core/geometry/modifiers/modifierProcessor.js';
export { meshToRenderData } from './core/geometry/utils/meshData.js';
export { queryFaces } from './core/geometry/selection/faceQuery.js';
export { queryVertices } from './core/geometry/selection/vertexQuery.js';
export { MODIFIER_REGISTRY } from './core/geometry/modifiers/registry/index.js';
export { TOPOLOGY_MODIFIERS } from './core/geometry/modifiers/registry/topology.js';
export { TRANSFORM_MODIFIERS } from './core/geometry/modifiers/registry/transforms.js';
export { ATTRIBUTE_MODIFIERS } from './core/geometry/modifiers/registry/attributes.js';
export { SCULPTING_MODIFIERS } from './core/geometry/modifiers/registry/sculpting.js';
export { BOOLEAN_MODIFIERS } from './core/geometry/modifiers/registry/booleans.js';
export { DEBUG_MODIFIERS } from './core/geometry/modifiers/registry/debug.js';
export { CSG } from './core/geometry/csg/index.js';
export {
	TreeGenerator,
	generateTreeProceduralData,
	getTreePreset,
	listTreePresets
} from './core/geometry/generators/tree/treeGenerator.js';
export { TreeGrowthSystem } from './core/geometry/generators/tree/treeGrowthSystem.js';
export { TreeGeometryBuilder } from './core/geometry/generators/tree/treeGeometryBuilder.js';
export { validateTreeProceduralData } from './core/geometry/generators/tree/treeValidation.js';
export {
	TREE_PRESETS,
	TREE_PRESET_NAMES,
	TREE_PRESET_ALIASES,
	TREE_MATERIAL_NEEDS
} from './core/geometry/generators/tree/treePresets.js';
export {
	REQUIRED_TREE_BARK_TYPES,
	REQUIRED_TREE_LEAF_TYPES,
	canonicalBarkType,
	canonicalLeafType
} from './core/geometry/generators/tree/treeMaterialCatalog.js';
export {
	BOTANICAL_ARCHETYPES,
	BOTANICAL_QUALITY,
	botanicalQuality
} from './core/geometry/generators/botany/BotanicalArchetypes.js';
export {
	BOTANICAL_SPECIES,
	getBotanicalSpecies,
	listBotanicalSpecies,
	searchBotanicalSpecies
} from './core/geometry/generators/botany/BotanicalSpeciesCatalog.js';
export {
	generateBotanicalCluster,
	generateBotanicalPlant
} from './core/geometry/generators/botany/BotanicalGenerator.js';
export { validateBotanicalGeometry } from './core/geometry/generators/botany/BotanicalValidation.js';
export { createHairPatch } from './core/components/human/hairBuilder.js';
export { createRiggedHuman, createRiggedHuman as generateHuman } from './core/components/human/humanGenerator.js';
export { HUMAN_SKELETON_DATA } from './core/components/human/skeletonData.js';
export { Skeleton } from './core/animation/skeleton.js';
export { AnimationManager } from './core/animation/animationManager.js';
export { solveCCD } from './core/animation/ik/ccdSolver.js';
export { createAwtsmoosThreeBufferGeometry } from './adapters/three/bufferGeometry.js';
export { createAwtsmoosThreeMaterial } from './adapters/three/materialFactory.js';
export { createProceduralThreeMesh } from './adapters/three/meshFactory.js';
export { createProceduralTreeThreeGroup } from './adapters/three/treeMeshFactory.js';
export { removeWhiteLeafTextureBackgroundOnce } from './adapters/three/treeAlphaTexture.js';
export { AwtsmoosMesh } from './core/meshText/AwtsmoosMesh.js';
export { compileMeshText } from './core/meshText/meshTextCompiler.js';
export { tokenizeMeshText } from './core/meshText/meshTextTokenizer.js';
export { buildMeshRecipe } from './core/meshText/meshArtifactBuilder.js';
export {
	MeshGeneratorRegistry,
	listMeshGenerators,
	meshGeneratorRegistry,
	registerMeshGenerator,
	resolveMeshGenerator
} from './core/meshText/meshGeneratorRegistry.js';
export {
	createMeshRecipe,
	deserializeMeshRecipe,
	hashMeshRecipe,
	serializeMeshRecipe,
	validateMeshRecipe
} from './core/recipes/meshRecipe.js';
export {
	canonicalizeRecipeValue,
	hashStableRecipeValue,
	stableRecipeJson
} from './core/recipes/stableRecipeJson.js';
