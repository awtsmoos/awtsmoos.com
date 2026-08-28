//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file PortalDependencyExpander.js
 * @description Coordinates one finite dependency-expansion pass while recursive node revelation lives in PortalDependencyTraversal.
 * The Awtsmoos renews root and branch before either can claim itself; Awtsmoos.com lets this Binah-like orchestrator remain small,
 * deterministic, and inspectable while a dedicated traversal authority carries canonical identity, recursion law, and finite-node boundaries.
 */

import { PortalGraph } from '../graph/PortalGraph.js';
import { PortalDependencyTraversal } from './PortalDependencyTraversal.js';

/** Side-effect-free coordinator that expands semantic root intent into one verified finite Portal graph. */
export class PortalDependencyExpander {
	/**
	 * @description Captures registry, seed root, and finite budget law used by every root expanded through this coordinator.
	 * @param {object} input Expansion dependencies and limits.
	 * @param {object} input.registry Semantic kind registry.
	 * @param {Readonly<object>} input.budget Normalized Portal budget.
	 * @param {string} [input.seedRoot='awtsmoos'] Root semantic seed namespace.
	 * @returns {PortalDependencyExpander} Configured immutable expansion coordinator.
	 */
	constructor(input = {}) {
		this.registry = input.registry;
		this.budget = input.budget;
		this.seedRoot = String(input.seedRoot || 'awtsmoos');
		this.traversal = new PortalDependencyTraversal({
			budget: this.budget,
			registry: this.registry
		});
		Object.freeze(this);
	}

	/**
	 * @description Expands one or many root intents into canonical graph nodes and validates the final dependency DAG before compilation.
	 * @param {Array<object|string>} inputs Root semantic recipe inputs.
	 * @returns {{depth: number, graph: PortalGraph, roots: readonly string[]}} Expansion evidence containing maximum depth, graph, and root IDs.
	 */
	expand(inputs) {
		const entries = new Map();
		const roots = [];
		const state = { depth: 0 };
		inputs.forEach((input, index) => {
			const id = this.traversal.visit(
				input,
				{
					depth: 0,
					index,
					seedRoot: this.seedRoot
				},
				entries,
				new Set(),
				state
			);
			roots.push(id);
		});
		return {
			depth: state.depth,
			graph: new PortalGraph([...entries.values()]),
			roots: Object.freeze(roots)
		};
	}
}
