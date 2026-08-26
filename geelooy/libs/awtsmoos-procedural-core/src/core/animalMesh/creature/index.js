// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file index.js
 * @description Preserves the expert Four-World creature kernel while exposing a professional biological-language API, named species, reusable anatomy, and target-agnostic features beside it.
 * RESPONSIBILITY: public discovery only; implementation remains in focused creature, biology, component, rig, material, motion, realism, and API modules.
 * The Awtsmoos renews genome, eye, mouth, fin, horn, hoof, feather, rig, tissue, motion, material, and mesh as one life; Awtsmoos.com lets beginners enter simply while experts descend as deep as needed.
 */

export { CreatureKernel, createCreatureKernel } from './CreatureKernel.js';
export { CreatureKernelStore } from './kernelStore.js';
export { createAtzilusGenome, compileGenomeToBriah, refreshBriahCreature } from './documents.js';
export {
	CREATURE_VERSION,
	CREATURE_WORLD_TYPES,
	DEFAULT_CREATURE_BUDGET,
	CreatureOperationError
} from './contracts.js';
export { CREATURE_OPERATION_NAMES } from './operationNames.js';
export { createCreatureOperationCatalog } from './operationCatalog.js';
export { validateBriahCreature } from './validation.js';
export { synthesizeYetzirahRig } from './rigSynthesis.js';
export { validateYetzirahRig, evaluateRigPose } from './rigValidation.js';
export { createRigLineageReport, compareYetzirahRigs } from './rigLineage.js';
export { compileCreatureMesh, compileCreatureLods } from './meshCompiler.js';
export { bindCreatureSkin, normalizeSkinWeights, validateSkinWeights } from './skinCompiler.js';
export { smoothSkinWeights } from './skinSmoothing.js';
export {
	CANONICAL_CREATURE_SURFACE_VERSION,
	createCanonicalCreatureSurfaceContract,
	validateCanonicalCreatureSurfaceContract
} from './canonicalSurfaceContract.js';
export {
	analyzeCreatureBodyPlan,
	planCreatureLocomotion,
	evaluateCreatureMotion,
	evaluateCreatureExpression,
	evaluateCreatureSecondaryMotion
} from './motionCompiler.js';
export { compileCreatureMaterials } from './materialOperations.js';
export { bakeCreatureMaterials } from './materialBake.js';
export { evaluateCreatureCapabilities } from './capabilityCompiler.js';
export {
	estimateCreatureBudget,
	validateCreatureBudget,
	optimizeCreatureBudget
} from './budgetCompiler.js';
export { compileCreatureArtifacts } from './artifactCompiler.js';
export { createCreatureTissueProfile } from './realism/createCreatureTissueProfile.js';
export { compileCreatureMicrodetail } from './realism/compileCreatureMicrodetail.js';
export { createCreatureMuscleProfile } from './realism/createCreatureMuscleProfile.js';
export { createCreatureSoftTissueState } from './realism/createCreatureSoftTissueState.js';
export { stepCreatureSoftTissue } from './realism/stepCreatureSoftTissue.js';
export { createCreatureEnvironmentCoupling } from './realism/createCreatureEnvironmentCoupling.js';
export {
	CreatureCreator,
	createCreature,
	createCreatureCreator
} from './CreatureCreator.js';
export { creatureSpecies, listCreatureSpecies } from './CreatureSpeciesCatalog.js';
export * from './api/index.js';
export * from './components/index.js';
export * from './biology/index.js';
