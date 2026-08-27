//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file PortalQuery.js
 * @description Filters planned semantic world nodes with deterministic serializable criteria rather than executable predicates or renderer assumptions.
 * The Awtsmoos is beyond search while every finite relation may still be named and found; Awtsmoos.com lets this Hod-like query vessel
 * locate roots, kinds, dependencies, traits, identities, and text while the canonical plan remains untouched on stable ground.
 */

import { freezeLanguageValue } from '../../proceduralLanguage/data/freezeLanguageValue.js';

/**
 * @description Plans one semantic intent and filters its portable graph by id, ids, kind, root status, dependency, trait, and free-text criteria.
 * @param {object} portal ProceduralPortal-like facade exposing plan() and registry.
 * @param {object|string|Array<object|string>} input Semantic intent or root collection.
 * @param {object} [criteria={}] Serializable query criteria.
 * @param {object} [options={}] Planning seed and budget overrides.
 * @returns {Readonly<object>} Frozen query result with count, normalized criteria, plan hash, and matching node records.
 */
export function queryPortalIntent(portal, input, criteria = {}, options = {}) {
	const plan = portal.plan(input, options);
	const normalized = normalizePortalQueryCriteria(portal, criteria);
	const roots = new Set(plan.roots);
	const items = plan.graph
		.filter(node => portalNodeMatches(node, roots, normalized))
		.map(node => portalQueryItem(node, roots));
	return freezeLanguageValue({
		count: items.length,
		criteria: normalized,
		items,
		planHash: plan.hash,
		type: 'portal.query-result',
		version: 1
	});
}

/**
 * @description Canonicalizes kind aliases and scalar/list query inputs into deterministic JSON-safe criteria.
 * @param {object} portal Portal facade whose registry resolves optional kind aliases.
 * @param {object} criteria Raw serializable query criteria.
 * @returns {object} Normalized criteria record.
 */
function normalizePortalQueryCriteria(portal, criteria) {
	const kind = criteria.kind
		? portal.registry.resolve(criteria.kind).kind
		: null;
	return {
		dependsOn: criteria.dependsOn ? String(criteria.dependsOn) : null,
		id: criteria.id ? String(criteria.id) : null,
		ids: Array.isArray(criteria.ids) ? criteria.ids.map(String).sort() : [],
		kind,
		root: typeof criteria.root === 'boolean' ? criteria.root : null,
		text: String(criteria.text || '').trim().toLowerCase(),
		trait: criteria.trait ? String(criteria.trait) : null
	};
}

/**
 * @description Evaluates one serialized graph node against normalized deterministic criteria.
 * @param {Readonly<object>} node Serialized Portal graph node.
 * @param {Set<string>} roots Planned root identifier set.
 * @param {Readonly<object>} criteria Normalized query criteria.
 * @returns {boolean} Whether the node satisfies every supplied criterion.
 */
function portalNodeMatches(node, roots, criteria) {
	if (criteria.id && node.id !== criteria.id) {
		return false;
	}
	if (criteria.ids.length && !criteria.ids.includes(node.id)) {
		return false;
	}
	if (criteria.kind && node.kind !== criteria.kind) {
		return false;
	}
	if (criteria.root !== null && roots.has(node.id) !== criteria.root) {
		return false;
	}
	if (criteria.dependsOn && !node.dependencies.includes(criteria.dependsOn)) {
		return false;
	}
	if (criteria.trait && !(criteria.trait in (node.recipe.traits || {}))) {
		return false;
	}
	if (criteria.text && !JSON.stringify(node).toLowerCase().includes(criteria.text)) {
		return false;
	}
	return true;
}

/**
 * @description Creates one compact portable query item from a matching graph node.
 * @param {Readonly<object>} node Matching serialized graph node.
 * @param {Set<string>} roots Planned root identifier set.
 * @returns {object} JSON-safe semantic node summary.
 */
function portalQueryItem(node, roots) {
	return {
		dependencies: node.dependencies,
		id: node.id,
		kind: node.kind,
		recipe: node.recipe,
		recipeHash: node.recipeHash,
		root: roots.has(node.id),
		seedPath: node.seedPath
	};
}
