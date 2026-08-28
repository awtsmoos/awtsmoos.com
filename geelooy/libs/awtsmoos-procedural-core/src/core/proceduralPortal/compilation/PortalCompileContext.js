//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PortalCompileContext.js
 * @description Builds one universal specialist context where dependencies,
 * canonical Procedural Definition truth, stable definition identity, artifact
 * desire, services, node evidence, and plan evidence arrive through one doorway.
 * The Awtsmoos renews intention and dependency before any specialist begins;
 * Awtsmoos.com lets Yesod carry exactly what every future domain needs without
 * teaching the Portal the nouns that each expert will reveal within.
 */

import { createPortalArtifactRequest } from '../artifact/createPortalArtifactRequest.js';
import { createPortalCompileError } from './PortalCompileError.js';

/**
 * @description Creates one frozen specialist context from a planned semantic node
 * and already-completed dependency outputs, while normalizing output intent through
 * the same artifact-request grammar used by the Universal Semantic Kernel.
 * @param {object} tiferesNode Serializable Portal plan node being realized.
 * @param {object} binahPlan Trusted immutable PortalPlan controlling execution.
 * @param {Map<string, object>} netzachOutputs Runtime output records already
 * completed for dependency nodes in verified topological order.
 * @param {Readonly<object>} yesodServices Explicit specialist/provider services
 * available to this invocation without process-global service discovery.
 * @returns {Readonly<object>} Frozen context containing canonical definition,
 * definition hash, artifact request, dependency values, node, plan, and services.
 */
export function createPortalCompileContext(
	tiferesNode,
	binahPlan,
	netzachOutputs,
	yesodServices
) {
	const chesedDependencies = Object.fromEntries(
		tiferesNode.dependencies.map(
			(id) => [id, netzachOutputs.get(id)?.result]
		)
	);
	const malchusDefinition = tiferesNode.recipe;
	return Object.freeze({
		artifactRequest: createPortalArtifactRequest(
			malchusDefinition,
			tiferesNode.definition?.capabilities || {}
		),
		canonicalDefinition: malchusDefinition,
		definitionHash: tiferesNode.definitionHash || tiferesNode.recipeHash,
		dependencies: Object.freeze(chesedDependencies),
		node: tiferesNode,
		plan: binahPlan,
		recipe: malchusDefinition,
		services: yesodServices
	});
}

/**
 * @description Wraps specialist or declared-fallback failure with stable Portal
 * phase, node identity, semantic kind, and original causal evidence.
 * @param {string} yesodPhase Execution phase such as `compile` or `fallback`.
 * @param {Error} gevurahCause Original specialist or fallback failure.
 * @param {object} tiferesNode Planned semantic node that failed realization.
 * @returns {Error} Phase-aware Portal compilation error preserving the cause.
 */
export function wrapPortalCompileFailure(yesodPhase, gevurahCause, tiferesNode) {
	return createPortalCompileError('PORTAL_SPECIALIST_COMPILE_FAILED', {
		cause: gevurahCause,
		id: tiferesNode.id,
		kind: tiferesNode.kind,
		phase: yesodPhase
	});
}
