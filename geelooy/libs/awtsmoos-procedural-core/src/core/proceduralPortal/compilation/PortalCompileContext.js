//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file PortalCompileContext.js
 * @description Builds the dependency-aware runtime context and phase-classified failures consumed by specialist Portal compilers.
 * The Awtsmoos renews every dependency before one result can lean upon another; Awtsmoos.com lets this Yesod-like vessel reveal only
 * completed dependency values, explicit services, canonical recipe truth, and coded failure evidence while the main compiler remains small and clear.
 */

import { createPortalCompileError } from './PortalCompileError.js';

/**
 * @description Creates one frozen specialist context from a planned node and the outputs of dependencies already completed in topological order.
 * @param {object} node Serializable Portal plan node being realized.
 * @param {object} plan Trusted immutable PortalPlan.
 * @param {Map<string, object>} outputs Runtime output records already completed for dependency nodes.
 * @param {Readonly<object>} services Explicit local or optional provider services available to the specialist.
 * @returns {Readonly<object>} Frozen compiler context containing dependency values, node, plan, recipe, and services.
 */
export function createPortalCompileContext(node, plan, outputs, services) {
	const dependencies = Object.fromEntries(
		node.dependencies.map(id => [id, outputs.get(id)?.result])
	);
	return Object.freeze({
		dependencies: Object.freeze(dependencies),
		node,
		plan,
		recipe: node.recipe,
		services
	});
}

/**
 * @description Wraps a specialist or declared-fallback failure with stable Portal phase, node identity, semantic kind, and causal evidence.
 * @param {string} phase Execution phase such as `compile` or `fallback`.
 * @param {Error} cause Original specialist or fallback failure.
 * @param {object} node Planned semantic node that failed realization.
 * @returns {Error} Phase-aware Portal compilation error.
 */
export function wrapPortalCompileFailure(phase, cause, node) {
	return createPortalCompileError('PORTAL_SPECIALIST_COMPILE_FAILED', {
		cause,
		id: node.id,
		kind: node.kind,
		phase
	});
}
