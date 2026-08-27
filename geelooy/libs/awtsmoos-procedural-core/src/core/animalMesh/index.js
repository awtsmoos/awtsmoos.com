// B"H
// Boruch Hashem
// Blessed is He
/**
 * Every public creature vessel is gathered here without concealing maturity.
 * The Awtsmoos renews geometry, genome, phenotype, and motion as inspectable
 * Awtsmoos.com contracts inside one authoritative animal system.
 */
export {
	ANIMAL_MESH_COORDINATE_SYSTEM,
	ANIMAL_MESH_LIMITS,
	ANIMAL_MESH_OPERATIONS,
	ANIMAL_MESH_PATCH_SCHEMA,
	ANIMAL_MESH_SCHEMA,
	ANIMAL_MESH_SCHEMA_VERSION,
	ANIMAL_MESH_VIEWS,
	CORE_EXECUTABLE_OPERATIONS
} from "./constants/animalMeshContract.js";
export { ANIMAL_LANDMARK_NAMES, ANIMAL_LANDMARK_SET, isKnownAnimalLandmark } from "./landmarks/landmarkCatalog.js";
export { animalMeshPatchSchema, animalMeshRecipeSchema } from "./schema/index.js";
export { AnimalMeshRecipeValidator, animalMeshRecipeValidator } from "./validation/AnimalMeshRecipeValidator.js";
export { createAnimalMeshRecipe, deserializeAnimalMeshRecipe, hashAnimalMeshRecipe, serializeAnimalMeshRecipe } from "./recipes/createAnimalMeshRecipe.js";
export { AnimalMeshPatchApplier, animalMeshPatchApplier } from "./recipes/AnimalMeshPatchApplier.js";
export { AnimalMeshPatchBuilder } from "./recipes/AnimalMeshPatchBuilder.js";
export { AnimalMeshOperationRegistry, animalMeshOperationRegistry } from "./compiler/OperationRegistry.js";
export { createDefaultAnimalMeshOperationRegistry } from "./compiler/createDefaultOperationRegistry.js";
export { AnimalMeshCompiler, animalMeshCompiler } from "./compiler/AnimalMeshCompiler.js";
export { AnimalMeshSession } from "./compiler/AnimalMeshSession.js";
export { buildEllipticalLoft } from "./geometry/ellipticalLoft.js";
export { createParallelTransportFrame, createParallelTransportFrames } from "./geometry/parallelTransportFrames.js";
export { buildAnimalRig } from "./rig/rigBuilder.js";
export { assignAutomaticBoneWeights } from "./rig/automaticWeights.js";
export { createAnimalMeshValidationReport } from "./validation/meshReport.js";
export { createAnimalMorphologyReport } from "./validation/morphologyReport.js";
export {
	AnimalArchetypeRegistry,
	animalArchetypeRegistry,
	listAnimalArchetypes,
	registerAnimalArchetype,
	resolveAnimalArchetype
} from "./archetypes/AnimalArchetypeRegistry.js";
export { analyzeAnimalReferences } from "./references/analyzeAnimalReferences.js";
export { createAnimalLodPlan, estimateAnimalMeshTriangles } from "./quality/triangleBudget.js";
export { getAnimalMeshCapabilities } from "./capabilities/animalMeshCapabilities.js";
export {
	ANIMAL_BODY_PLAN_CATALOG,
	listAnimalBodyPlans,
	resolveAnimalBodyPlan
} from "./morphology/bodyPlanCatalog.js";
export { createAnimalMorphologyProfile } from "./morphology/createAnimalMorphologyProfile.js";
export {
	ANIMAL_GENOME_RULES,
	breedAnimalGenomes,
	createAnimalGenome,
	normalizeAnimalGenome
} from "./morphology/animalGenome.js";
export { applyAnimalGenome } from "./morphology/recipeMorphology.js";
export {
	compileAnimalMorphologyVariant,
	createAnimalMorphologyVariant,
	createAnimalVariationSet
} from "./morphology/animalVariationCompiler.js";
export {
	compileAnimalPhenotype,
	createAnimalPhenotype
} from "./morphology/createAnimalPhenotype.js";
export { createAnimalLocomotionPlan } from "./motion/locomotionPlanner.js";
export { createAnimalLocomotionProfile } from "./motion/createLocomotionProfile.js";
export {
	ANIMAL_MESH_UPLOAD_PROMPT_TEMPLATE,
	ANIMAL_MESH_VISION_SYSTEM_PROMPT,
	createAnimalMeshUploadPrompt
} from "./prompts/promptCatalog.js";

/**
 * Additive API-driven creature kernel export. Existing animalMesh and root
 * imports remain untouched while semantic Four-Worlds operations become local.
 */
export * from "./creature/index.js";
