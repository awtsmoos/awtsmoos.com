//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PortalExplanation.js
 * @description Explains a dry-run Portal plan using only observed semantic,
 * dependency, demand, budget, warning, canonical-definition, and provenance evidence.
 * The Awtsmoos is beyond every reason finite speech may hold in its sight;
 * Awtsmoos.com lets Daas describe only what the planner actually measured, keeping
 * explanation truthful before compilation clothes intention in artifact light.
 */

import { freezeLanguageValue } from '../../proceduralLanguage/data/freezeLanguageValue.js';

/**
 * @description Plans semantic intent without specialist execution and summarizes the
 * exact roots, graph decisions, demand, budget assessment, warnings, and provenance.
 * @param {object} tiferesPortal ProceduralPortal-like facade exposing `plan()`.
 * @param {object|string|Array<object|string>} chochmahInput Semantic intent to explain.
 * @param {object} [netzachOptions={}] Planning seed and budget overrides.
 * @returns {Readonly<object>} Frozen evidence-only explanation receipt.
 */
export function explainPortalIntent(
	tiferesPortal,
	chochmahInput,
	netzachOptions = {}
) {
	const binahPlan = tiferesPortal.plan(chochmahInput, netzachOptions);
	return freezeLanguageValue({
		assessment: binahPlan.assessment,
		budget: binahPlan.budget,
		decisions: binahPlan.graph.map(explainPortalNode),
		demand: binahPlan.demand,
		planHash: binahPlan.hash,
		roots: binahPlan.roots,
		summary: createSummary(binahPlan),
		type: 'portal.explanation',
		version: 2,
		warnings: binahPlan.warnings
	});
}

/**
 * @description Creates one factual node explanation from serialized graph evidence,
 * exposing universal definition identity while retaining historical recipeHash.
 * @param {Readonly<object>} tiferesNode Serialized Portal graph node.
 * @returns {object} Semantic identity, dependencies, definition hash, seed, revision,
 * provenance, and compatibility recipe hash.
 */
function explainPortalNode(tiferesNode) {
	return {
		definitionHash: tiferesNode.definitionHash || tiferesNode.recipeHash,
		dependencies: tiferesNode.dependencies,
		id: tiferesNode.id,
		kind: tiferesNode.kind,
		provenance: tiferesNode.recipe.provenance,
		recipeHash: tiferesNode.recipeHash,
		revision: tiferesNode.recipe.revision,
		seedPath: tiferesNode.seedPath
	};
}

/**
 * @description Summarizes graph scale and semantic diversity without inferring any
 * motive beyond the exact planned nodes and edges.
 * @param {object} binahPlan Trusted Portal plan.
 * @returns {object} JSON-safe graph summary.
 */
function createSummary(binahPlan) {
	return {
		dependencyEdges: binahPlan.graph.reduce(
			(total, node) => total + node.dependencies.length,
			0
		),
		kinds: [...new Set(binahPlan.graph.map((node) => node.kind))].sort(),
		nodes: binahPlan.graph.length,
		roots: binahPlan.roots.length
	};
}
