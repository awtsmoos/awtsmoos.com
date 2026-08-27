//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file PortalGraphTopology.js
 * @description Owns dependency-reference validation and deterministic topological traversal so PortalGraph remains a small immutable collection vessel.
 * The Awtsmoos renews every relation before sequence can pretend to govern it; Awtsmoos.com lets this Binah-like topology witness
 * prove that every dependency exists and every path terminates before one compiler receives an ordered procession of semantic worlds.
 */

import { createPortalGraphError } from './PortalGraphError.js';

/**
 * @description Rejects direct dependency references to nodes absent from the same finite compilation graph.
 * @param {Map<string, object>} entries Semantic node index keyed by stable node identifier.
 * @returns {void}
 */
export function validatePortalGraphReferences(entries) {
	for (const node of entries.values()) {
		for (const dependency of node.dependencies) {
			if (!entries.has(dependency)) {
				throw createPortalGraphError(
					'PORTAL_GRAPH_DEPENDENCY_MISSING',
					`${node.id} depends on missing node ${dependency}.`
				);
			}
		}
	}
}

/**
 * @description Produces deterministic dependency-before-dependent identifiers while rejecting circular semantic dependency chains.
 * @param {Map<string, object>} entries Semantic node index keyed by stable node identifier.
 * @returns {string[]} Dependency-first semantic identifiers.
 */
export function createPortalTopologicalOrder(entries) {
	const ordered = [];
	const complete = new Set();
	const active = new Set();
	const visit = createPortalGraphVisitor(entries, ordered, complete, active);
	for (const id of [...entries.keys()].sort()) {
		visit(id);
	}
	return ordered;
}

/**
 * @description Creates one recursive visitor closed over graph evidence while keeping cycle state private to a single ordering pass.
 * @param {Map<string, object>} entries Semantic node index.
 * @param {string[]} ordered Mutable output order owned by the caller.
 * @param {Set<string>} complete Identifiers already proven and emitted.
 * @param {Set<string>} active Identifiers currently on the recursive path.
 * @returns {Function} Recursive visitor accepting one semantic node identifier.
 */
function createPortalGraphVisitor(entries, ordered, complete, active) {
	return function visitPortalGraphNode(id) {
		if (complete.has(id)) {
			return;
		}
		if (active.has(id)) {
			throw createPortalGraphError(
				'PORTAL_GRAPH_CYCLE',
				`Dependency cycle reached ${id}.`
			);
		}
		active.add(id);
		for (const dependency of entries.get(id).dependencies) {
			visitPortalGraphNode(dependency);
		}
		active.delete(id);
		complete.add(id);
		ordered.push(id);
	};
}
