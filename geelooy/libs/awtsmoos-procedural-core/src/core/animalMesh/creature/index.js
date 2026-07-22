// B"H
// Boruch Hashem
// Blessed is He
/** Public Four-World creature-kernel surface with exact local contracts. */

export { CreatureKernel, createCreatureKernel } from "./CreatureKernel.js";
export { CreatureKernelStore } from "./kernelStore.js";
export { createAtzilusGenome, compileGenomeToBriah, refreshBriahCreature } from "./documents.js";
export { CREATURE_VERSION, CREATURE_WORLD_TYPES, DEFAULT_CREATURE_BUDGET, CreatureOperationError } from "./contracts.js";
export { CREATURE_OPERATION_NAMES } from "./operationNames.js";
export { createCreatureOperationCatalog } from "./operationCatalog.js";
export { validateBriahCreature } from "./validation.js";
export { synthesizeYetzirahRig } from "./rigSynthesis.js";
export { validateYetzirahRig, evaluateRigPose } from "./rigValidation.js";
export { createRigLineageReport, compareYetzirahRigs } from "./rigLineage.js";
export { compileCreatureMesh, compileCreatureLods } from "./meshCompiler.js";
export { bindCreatureSkin, normalizeSkinWeights, validateSkinWeights } from "./skinCompiler.js";
export { smoothSkinWeights } from "./skinSmoothing.js";
export {
	analyzeCreatureBodyPlan,
	planCreatureLocomotion,
	evaluateCreatureMotion,
	evaluateCreatureExpression,
	evaluateCreatureSecondaryMotion
} from "./motionCompiler.js";
export { compileCreatureMaterials } from "./materialOperations.js";
export { bakeCreatureMaterials } from "./materialBake.js";
export { evaluateCreatureCapabilities } from "./capabilityCompiler.js";
export { estimateCreatureBudget, validateCreatureBudget, optimizeCreatureBudget } from "./budgetCompiler.js";
export { compileCreatureArtifacts } from "./artifactCompiler.js";
