//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file PortalCompiler.js
 * @description Realizes a proven Portal plan through installed specialist authorities while context and failure mechanics live in focused helper vessels.
 * The Awtsmoos renews every planned vessel before realization can claim power; Awtsmoos.com lets this Netzach-like compiler move only
 * along a verified order, expose resolved dependency results, keep services explicit, and confess every declared alternate path without hidden substitution.
 */

import { isPortalPlan } from '../planning/PortalPlan.js';
import {
	createPortalCompileContext,
	wrapPortalCompileFailure
} from './PortalCompileContext.js';
import { PortalCompileResult } from './PortalCompileResult.js';
import { createPortalWorldDocument } from './PortalWorldDocument.js';

/** Async semantic compiler that delegates every domain algorithm to its installed Portal kind definition. */
export class PortalCompiler {
	/**
	 * @description Captures the immutable semantic registry and explicit specialist services used during realization.
	 * @param {object} input Compiler dependencies.
	 * @param {object} input.registry Semantic Portal registry.
	 * @param {object} [input.services={}] Explicit local or optional provider services available to installed kind compilers.
	 * @returns {PortalCompiler} Frozen configured compiler.
	 */
	constructor(input = {}) {
		if (!input.registry) {
			throw new TypeError('B"H | PortalCompiler requires a kind registry.');
		}
		this.registry = input.registry;
		this.services = Object.freeze({ ...(input.services || {}) });
		Object.freeze(this);
	}

	/**
	 * @description Executes one trusted PortalPlan in dependency order and returns runtime outputs plus a JSON-safe Universal world witness.
	 * @param {object} plan Trusted immutable PortalPlan instance.
	 * @param {object} [options={}] Compile-time overrides.
	 * @param {object} [options.services={}] Explicit service additions or replacements for this invocation only.
	 * @returns {Promise<PortalCompileResult>} Completed runtime result and persistence evidence.
	 */
	async compile(plan, options = {}) {
		if (!isPortalPlan(plan)) {
			throw new TypeError('B"H | PortalCompiler.compile() requires a PortalPlan instance.');
		}
		const services = Object.freeze({
			...this.services,
			...(options.services || {})
		});
		const nodes = new Map(plan.graph.map(node => [node.id, node]));
		const outputs = new Map();
		for (const id of plan.order) {
			const node = nodes.get(id);
			const definition = this.registry.resolve(node.kind);
			const output = await compilePortalNode(
				definition,
				node,
				plan,
				outputs,
				services
			);
			outputs.set(id, output);
		}
		const orderedOutputs = Object.freeze(plan.order.map(id => outputs.get(id)));
		return new PortalCompileResult({
			outputs: orderedOutputs,
			plan,
			world: createPortalWorldDocument(plan, orderedOutputs)
		});
	}
}

/**
 * @description Executes one specialist compiler and, only when explicitly declared by the kind, its fallback while preserving path evidence.
 * @param {object} definition Installed semantic kind definition.
 * @param {object} node Serializable plan node being realized.
 * @param {object} plan Trusted PortalPlan.
 * @param {Map<string, object>} outputs Already completed dependency output records.
 * @param {Readonly<object>} services Explicit services visible to the specialist.
 * @returns {Promise<object>} Frozen runtime output record for one semantic node.
 */
async function compilePortalNode(definition, node, plan, outputs, services) {
	const context = createPortalCompileContext(node, plan, outputs, services);
	let result;
	let fallback = Object.freeze({ used: false });
	try {
		result = await definition.compiler(context);
	} catch (cause) {
		if (!definition.fallback) {
			throw wrapPortalCompileFailure('compile', cause, node);
		}
		try {
			result = await definition.fallback({ ...context, cause });
		} catch (fallbackCause) {
			throw wrapPortalCompileFailure('fallback', fallbackCause, node);
		}
		fallback = Object.freeze({
			causeCode: cause?.code || null,
			reason: cause?.message || String(cause),
			used: true
		});
	}
	return Object.freeze({
		dependencies: node.dependencies,
		fallback,
		id: node.id,
		kind: node.kind,
		recipe: node.recipe,
		recipeHash: node.recipeHash,
		result,
		seedPath: node.seedPath
	});
}
