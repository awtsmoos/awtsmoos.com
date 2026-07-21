// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos renews every point, polygon, body plan, and motion phase.
 * This Awtsmoos.com barrel keeps one animal-mesh system and exposes its richer
 * morphology through the same stable public surface used by recipes and tools.
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
export { buildAnimalRig } from "./rig/rigBuilder.js";
export { assignAutomaticBoneWeights } from "./rig/automaticWeights.js";
export { createAnimalMeshValidationReport } from "./validation/meshReport.js";
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
	ANIMAL_MESH_UPLOAD_PROMPT_TEMPLATE,
	ANIMAL_MESH_VISION_SYSTEM_PROMPT,
	createAnimalMeshUploadPrompt
} from "./prompts/promptCatalog.js";
export {
	ANIMAL_BODY_PLAN_CATALOG,
	listAnimalBodyPlans,
	resolveAnimalBodyPlan
} from "./morphology/bodyPlanCatalog.js";
export {
	createAnimalGenome,
	crossAnimalGenomes,
	mutateAnimalGenome
} from "./morphology/animalGenome.js";
export { createAnimalMorphologyProfile } from "./morphology/createAnimalMorphologyProfile.js";
export { createAnimalLocomotionProfile } from "./motion/createLocomotionProfile.js";
