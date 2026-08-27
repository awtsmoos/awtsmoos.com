//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file PortalDiffNodes.js
 * @description Owns deterministic node-level Portal diff classification while the public diff operation owns plan orchestration and receipt shape.
 * The Awtsmoos is One before added, removed, changed, and unchanged receive their finite names; Awtsmoos.com lets this Gevurah-like sorter
 * separate semantic branches by stable identity and canonical definition delta without forcing the public operation to carry every comparison border.
 */

import { diffProceduralDefinitions } from '../../proceduralLanguage/diff/diffProceduralDefinitions.js';

/**
 * @description Compares two serialized Portal graph collections by stable node identity and canonical recipe hash.
 * @param {readonly object[]} beforeNodes Earlier serialized Portal graph nodes.
 * @param {readonly object[]} afterNodes Later serialized Portal graph nodes.
 * @returns {{added:object[],changed:object[],removed:object[],unchanged:object[]}} Mutable local diff buckets ready for final receipt freezing.
 */
export function diffPortalNodeCollections(beforeNodes, afterNodes) {
	const leftNodes = portalNodeMap(beforeNodes);
	const rightNodes = portalNodeMap(afterNodes);
	const ids = [...new Set([...leftNodes.keys(), ...rightNodes.keys()])].sort();
	const buckets = {
		added: [],
		changed: [],
		removed: [],
		unchanged: []
	};
	for (const id of ids) {
		classifyPortalNodeDiff(id, leftNodes, rightNodes, buckets);
	}
	return buckets;
}

/**
 * @description Compares root identity sets independently from dependency-node changes.
 * @param {readonly string[]} before Earlier root identifiers.
 * @param {readonly string[]} after Later root identifiers.
 * @returns {{added:string[],removed:string[]}} Sorted root identifier changes.
 */
export function diffPortalRootIds(before, after) {
	const left = new Set(before);
	const right = new Set(after);
	return {
		added: [...right].filter(id => !left.has(id)).sort(),
		removed: [...left].filter(id => !right.has(id)).sort()
	};
}

/**
 * @description Classifies one stable node identifier into exactly one semantic diff bucket.
 * @param {string} id Canonical Portal node identifier.
 * @param {Map<string,object>} leftNodes Earlier node lookup.
 * @param {Map<string,object>} rightNodes Later node lookup.
 * @param {object} buckets Local diff accumulator.
 * @returns {void} Adds exactly one serializable witness to the appropriate bucket.
 */
function classifyPortalNodeDiff(id, leftNodes, rightNodes, buckets) {
	const before = leftNodes.get(id);
	const after = rightNodes.get(id);
	if (!before) {
		buckets.added.push(portalNodeSummary(after));
		return;
	}
	if (!after) {
		buckets.removed.push(portalNodeSummary(before));
		return;
	}
	if (before.recipeHash === after.recipeHash) {
		buckets.unchanged.push(portalNodeSummary(after));
		return;
	}
	buckets.changed.push({
		after: portalNodeSummary(after),
		before: portalNodeSummary(before),
		changes: diffProceduralDefinitions(before.recipe, after.recipe)
	});
}

/**
 * @description Creates a stable identifier-to-node lookup from one serialized graph array.
 * @param {readonly object[]} nodes Serialized Portal graph nodes.
 * @returns {Map<string,object>} Lookup keyed by canonical semantic node id.
 */
function portalNodeMap(nodes) {
	return new Map(nodes.map(node => [node.id, node]));
}

/**
 * @description Creates the compact semantic witness used by added, removed, changed, and unchanged buckets.
 * @param {object} node Serialized Portal graph node.
 * @returns {{id:string,kind:string,recipeHash:string}} Stable node summary.
 */
function portalNodeSummary(node) {
	return {
		id: node.id,
		kind: node.kind,
		recipeHash: node.recipeHash
	};
}
