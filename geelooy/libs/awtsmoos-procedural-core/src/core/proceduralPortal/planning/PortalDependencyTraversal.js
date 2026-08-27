//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file PortalDependencyTraversal.js
 * @description Owns recursive semantic-node revelation while finite guard law lives in its own focused module.
 * The Awtsmoos renews root and branch before either can claim independent sequence; Awtsmoos.com lets this Binah-like traversal
 * resolve canonical kind before identity, preserve child seed lineage, expand declared and generated dependencies, and record one immutable node per truth.
 */

import { PortalGraphNode } from '../graph/PortalGraphNode.js';
import {
	createPortalRecipe,
	portalRecipeDependencies,
	portalRecipeRequestedKind
} from '../recipe/PortalRecipe.js';
import {
	assertPortalDependencyDepth,
	assertPortalDependencyNodeCount,
	assertPortalMatchingRecipe
} from './PortalDependencyGuards.js';
import { createPortalExpansionError, revealPortalDependencies } from './PortalDependencyFactory.js';

/** Recursive dependency-tree authority used only during one deterministic dry-run expansion. */
export class PortalDependencyTraversal {
	/**
	 * @description Captures the semantic registry and finite budget required for recursive dependency revelation.
	 * @param {object} input Traversal dependencies.
	 * @param {object} input.registry Semantic kind registry.
	 * @param {Readonly<object>} input.budget Normalized Portal budget.
	 * @returns {PortalDependencyTraversal} Frozen traversal authority.
	 */
	constructor(input = {}) {
		this.registry = input.registry;
		this.budget = input.budget;
		Object.freeze(this);
	}

	/**
	 * @description Resolves one recipe canonically, expands its child recipes, and records one immutable graph node exactly once.
	 * @param {object|string} input Recipe-like semantic intent.
	 * @param {object} context Stable sibling index, parent seed root, and recursion depth.
	 * @param {Map<string, PortalGraphNode>} entries Nodes already revealed in the current expansion.
	 * @param {Set<string>} active Semantic IDs currently on the recursion path.
	 * @param {{depth: number}} state Mutable maximum-depth evidence private to the current expansion.
	 * @returns {string} Canonical semantic node identifier.
	 */
	visit(input, context, entries, active, state) {
		assertPortalDependencyDepth(context.depth, this.budget);
		const definition = this.registry.resolve(portalRecipeRequestedKind(input));
		const recipe = createPortalRecipe(input, {
			...context,
			canonicalKind: definition.kind
		});
		const existing = entries.get(recipe.id);
		if (existing) {
			assertPortalMatchingRecipe(existing, recipe);
			return recipe.id;
		}
		if (active.has(recipe.id)) {
			throw createPortalExpansionError(
				'PORTAL_DEPENDENCY_CYCLE',
				`Recursive dependency reached ${recipe.id}.`
			);
		}
		active.add(recipe.id);
		state.depth = Math.max(state.depth, context.depth);
		const dependencies = this._revealDependencies(
			definition,
			recipe,
			context,
			entries,
			active,
			state
		);
		active.delete(recipe.id);
		const node = new PortalGraphNode({
			definition: definition.describe(),
			dependencies,
			recipe
		});
		entries.set(node.id, node);
		assertPortalDependencyNodeCount(entries.size, this.budget);
		return node.id;
	}

	/**
	 * @description Reveals declared child recipes, generated child recipes, and direct dependency references beneath one canonical parent recipe.
	 * @param {object} definition Installed semantic kind definition.
	 * @param {Readonly<object>} recipe Canonical parent recipe.
	 * @param {object} context Parent traversal context.
	 * @param {Map<string, PortalGraphNode>} entries Current graph-node index.
	 * @param {Set<string>} active Current recursive path.
	 * @param {{depth: number}} state Shared depth evidence.
	 * @returns {string[]} Canonical dependency identifiers.
	 */
	_revealDependencies(definition, recipe, context, entries, active, state) {
		const declared = portalRecipeDependencies(recipe);
		const generated = revealPortalDependencies(definition, recipe);
		const children = [...declared.dependencies, ...generated].map((dependency, index) => {
			return this.visit(
				dependency,
				{
					depth: context.depth + 1,
					index,
					seedRoot: recipe.seed
				},
				entries,
				active,
				state
			);
		});
		return [...children, ...declared.dependsOn];
	}
}
