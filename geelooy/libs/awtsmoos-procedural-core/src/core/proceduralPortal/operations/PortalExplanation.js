//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file PortalExplanation.js
 * @description Explains a Portal plan using only observed semantic, dependency, demand, budget, warning, and provenance evidence already present in the canonical planner.
 * The Awtsmoos is beyond every reason finite speech can hold; Awtsmoos.com lets this Daas-like explanation remain factual and restrained,
 * revealing what the planner chose and measured without inventing motives, provider promises, or hidden causes beyond the evidence gained.
 */

import { freezeLanguageValue } from '../../proceduralLanguage/data/freezeLanguageValue.js';

/**
 * @description Plans semantic intent and summarizes the exact roots, kinds, dependency edges, demand, budget assessment, warnings, and recipe provenance observed.
 * @param {object} portal ProceduralPortal-like facade exposing plan().
 * @param {object|string|Array<object|string>} input Semantic intent to explain.
 * @param {object} [options={}] Planning seed and budget overrides.
 * @returns {Readonly<object>} Frozen evidence-only explanation receipt.
 */
export function explainPortalIntent(portal, input, options = {}) {
	const plan = portal.plan(input, options);
	return freezeLanguageValue({
		assessment: plan.assessment,
		budget: plan.budget,
		decisions: plan.graph.map(explainPortalNode),
		demand: plan.demand,
		planHash: plan.hash,
		roots: plan.roots,
		summary: {
			dependencyEdges: plan.graph.reduce(
				(total, node) => total + node.dependencies.length,
				0
			),
			kinds: [...new Set(plan.graph.map(node => node.kind))].sort(),
			nodes: plan.graph.length,
			roots: plan.roots.length
		},
		type: 'portal.explanation',
		version: 1,
		warnings: plan.warnings
	});
}

/**
 * @description Creates one factual explanation record for a planned node using only serialized graph evidence.
 * @param {Readonly<object>} node Serialized Portal graph node.
 * @returns {object} Node explanation containing semantic identity, dependencies, recipe hash, seed path, revision, and provenance.
 */
function explainPortalNode(node) {
	return {
		dependencies: node.dependencies,
		id: node.id,
		kind: node.kind,
		provenance: node.recipe.provenance,
		recipeHash: node.recipeHash,
		revision: node.recipe.revision,
		seedPath: node.seedPath
	};
}
