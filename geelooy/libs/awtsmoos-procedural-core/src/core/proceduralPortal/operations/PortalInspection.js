//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file PortalInspection.js
 * @description Produces portable plan-backed semantic inspection without executing specialists or reaching into private graph maps.
 * The Awtsmoos sees root, dependency, trait, behavior, and provenance in one timeless light; Awtsmoos.com lets this Daas-like lens
 * reveal the finite plan as data so editors and agents can understand a world before one geometry buffer enters sight.
 */

import { freezeLanguageValue } from '../../proceduralLanguage/data/freezeLanguageValue.js';

/**
 * @description Plans semantic intent and returns compact root, node, budget, demand, warning, and provenance evidence without compilation.
 * @param {object} portal ProceduralPortal-like facade exposing plan().
 * @param {object|string|Array<object|string>} input Semantic intent to inspect.
 * @param {object} [options={}] Planning seed and budget overrides.
 * @returns {Readonly<object>} Frozen inspection result safe for UI, logging, persistence, and agent reasoning.
 */
export function inspectPortalIntent(portal, input, options = {}) {
	const plan = portal.plan(input, options);
	const roots = new Set(plan.roots);
	return freezeLanguageValue({
		assessment: plan.assessment,
		budget: plan.budget,
		demand: plan.demand,
		nodes: plan.graph.map(node => portalInspectionNode(node, roots)),
		planHash: plan.hash,
		roots: plan.roots,
		type: 'portal.inspection',
		version: 1,
		warnings: plan.warnings
	});
}

/**
 * @description Extracts semantic and dependency evidence from one serialized Portal graph node while preserving its canonical recipe witness.
 * @param {Readonly<object>} node Serialized Portal graph node.
 * @param {Set<string>} roots Planned root identifier set.
 * @returns {object} JSON-safe node inspection record.
 */
function portalInspectionNode(node, roots) {
	return {
		behaviors: node.recipe.behaviors,
		definition: node.definition,
		dependencies: node.dependencies,
		id: node.id,
		kind: node.kind,
		provenance: node.recipe.provenance,
		recipeHash: node.recipeHash,
		relationships: node.recipe.relationships,
		revision: node.recipe.revision,
		root: roots.has(node.id),
		seedPath: node.seedPath,
		traits: node.recipe.traits
	};
}
