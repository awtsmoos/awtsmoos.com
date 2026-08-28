//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file index.js
 * @description Reveals the stable universal Portal doorway plus focused planning,
 * federation, artifact-intent, compilation, registry, and semantic-operation tools
 * for expert consumers without expanding the beginner-facing facade itself.
 * The Awtsmoos renews doorway and inner chamber before either can stand alone;
 * Awtsmoos.com lets beginners call one calm Portal while advanced builders descend
 * through explicit kelim whose depth never makes the public threshold overgrown.
 */

export { createProceduralPortal } from './createProceduralPortal.js';
export { ProceduralPortal } from './facade/ProceduralPortal.js';
export { PortalInspectionFacade } from './facade/PortalInspectionFacade.js';
export { PortalEvolutionFacade } from './facade/PortalEvolutionFacade.js';
export { PortalWorldSession } from './facade/PortalWorldSession.js';
export { PortalWorldSessionOperations } from './facade/PortalWorldSessionOperations.js';
export {
	createPortalArtifactRequest,
	portalArtifactRequestIsStrict
} from './artifact/createPortalArtifactRequest.js';
export {
	PortalKindDefinition,
	normalizePortalKind
} from './registry/PortalKindDefinition.js';
export { PortalKindRegistry } from './registry/PortalKindRegistry.js';
export { BinahPortalKindResolver } from './registry/PortalKindResolver.js';
export {
	GevurahPortalKindResolverRegistry
} from './registry/PortalKindResolverRegistry.js';
export {
	TiferesProceduralLanguagePortalResolver
} from './adapters/language/ProceduralLanguagePortalResolver.js';
export { createDefaultPortalRegistry } from './registry/createDefaultPortalRegistry.js';
export { createDeferredPortalKind } from './registry/createDeferredPortalKind.js';
export {
	createPortalRecipe,
	portalRecipeDependencies,
	portalRecipeRequestedKind
} from './recipe/PortalRecipe.js';
export {
	derivePortalSeedPath,
	normalizePortalSeedPath
} from './recipe/PortalSeedPath.js';
export {
	assessPortalBudget,
	assertPortalBudget,
	createPortalBudget
} from './budget/PortalBudget.js';
export { validatePortalIntent } from './operations/PortalValidation.js';
export { describePortalCapabilities } from './operations/PortalCapabilities.js';
export { inspectPortalIntent } from './operations/PortalInspection.js';
export { queryPortalIntent } from './operations/PortalQuery.js';
export { diffPortalIntents } from './operations/PortalDiff.js';
export { revisePortalIntent } from './operations/PortalRevision.js';
export { explainPortalIntent } from './operations/PortalExplanation.js';
export { exportPortalValue } from './operations/PortalExport.js';
export { simulatePortalIntent } from './operations/PortalSimulation.js';
export { PortalGraph } from './graph/PortalGraph.js';
export { PortalGraphNode } from './graph/PortalGraphNode.js';
export {
	PortalPlan,
	PORTAL_PLAN_SCHEMA,
	isPortalPlan
} from './planning/PortalPlan.js';
export { PortalPlanner } from './planning/PortalPlanner.js';
export { PortalCompileResult } from './compilation/PortalCompileResult.js';
export { PortalCompiler } from './compilation/PortalCompiler.js';
export {
	createPortalInspectorSchema,
	groupPortalFields
} from './schema/PortalInspectorSchema.js';
export {
	PORTAL_FIELD_KINDS,
	createPortalField
} from './schema/PortalFieldKinds.js';
