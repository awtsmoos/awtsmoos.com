//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createWorldChangeImpactReceipt.js
 * @description Compares world semantic snapshots and reuses existing downstream closure to reveal deletion-safe, policy-aware incremental regeneration impact.
 * The Awtsmoos renews what was and what becomes before a removed edge can hide yesterday's consequence;
 * Awtsmoos.com joins before-and-after dependency light so incremental rebuilding follows truthful evidence.
 */
import { stableLanguageJson } from '../data/stableLanguageValue.js';
import { findAffectedProceduralNodes } from '../planning/findAffectedProceduralNodes.js';
import { WORLD_CHANGE_IMPACT_SCHEMA, WORLD_CHANGE_IMPACT_VERSION } from './WorldLineageProtocol.js';

/** Creates deterministic before/after world impact evidence from two semantic snapshots. */
export function createWorldChangeImpactReceipt(beforeKeter, afterChochmah) {
	const beforeIds = new Set(beforeKeter.identities.map((identityOhr) => identityOhr.id));
	const afterIds = new Set(afterChochmah.identities.map((identityOhr) => identityOhr.id));
	const addedIds = orderedIds(afterChochmah.definitionOrder.filter((id) => !beforeIds.has(id)), beforeKeter, afterChochmah);
	const removedIds = orderedIds(beforeKeter.definitionOrder.filter((id) => !afterIds.has(id)), beforeKeter, afterChochmah);
	const contentChangedIds = orderedIds(afterChochmah.definitionOrder.filter((id) => {
		return beforeIds.has(id) && beforeKeter.identitiesById[id].contentHash !== afterChochmah.identitiesById[id].contentHash;
	}), beforeKeter, afterChochmah);
	const edgeDeltaTiferes = createDependencyEdgeDelta(beforeKeter.dependencyEdges, afterChochmah.dependencyEdges);
	const dependencyEdgeChangedIds = orderedIds(edgeDeltaTiferes.changedIds, beforeKeter, afterChochmah);
	const directlyChangedIds = orderedIds([
		...addedIds,
		...removedIds,
		...contentChangedIds,
		...dependencyEdgeChangedIds
	], beforeKeter, afterChochmah);
	const unionGraphBinah = createUnionDependencyGraph(beforeKeter, afterChochmah);
	const affectedIds = findAffectedProceduralNodes(unionGraphBinah, directlyChangedIds);

	return Object.freeze({
		schema: WORLD_CHANGE_IMPACT_SCHEMA,
		version: WORLD_CHANGE_IMPACT_VERSION,
		beforeSemanticHash: beforeKeter.semanticHash,
		afterSemanticHash: afterChochmah.semanticHash,
		beforeDependencyHash: beforeKeter.dependencyHash,
		afterDependencyHash: afterChochmah.dependencyHash,
		semanticChanged: beforeKeter.semanticHash !== afterChochmah.semanticHash,
		dependencyChanged: beforeKeter.dependencyHash !== afterChochmah.dependencyHash,
		addedIds,
		removedIds,
		contentChangedIds,
		dependencyEdgeChangedIds,
		directlyChangedIds,
		affectedIds,
		unionDependencyEdges: unionGraphBinah.edges
	});
}

/** Finds symmetric dependency-edge differences and their endpoints. */
function createDependencyEdgeDelta(beforeEdges, afterEdges) {
	const beforeByKey = new Map(beforeEdges.map((edge) => [stableLanguageJson(edge), edge]));
	const afterByKey = new Map(afterEdges.map((edge) => [stableLanguageJson(edge), edge]));
	const changedEdges = [
		...beforeByKey.entries().filter(([key]) => !afterByKey.has(key)).map(([, edge]) => edge),
		...afterByKey.entries().filter(([key]) => !beforeByKey.has(key)).map(([, edge]) => edge)
	];
	return {
		changedIds: [...new Set(changedEdges.flatMap((edge) => [edge.from, edge.to]))]
	};
}

/** Builds deletion-safe union dependency evidence in after-then-before stable node order. */
function createUnionDependencyGraph(beforeSnapshot, afterSnapshot) {
	const orderedNodeIds = orderedIds([
		...afterSnapshot.definitionOrder,
		...beforeSnapshot.definitionOrder
	], beforeSnapshot, afterSnapshot);
	const edgeByKey = new Map();
	for (const edge of [...beforeSnapshot.dependencyEdges, ...afterSnapshot.dependencyEdges]) {
		edgeByKey.set(stableLanguageJson(edge), edge);
	}
	const edges = Object.freeze([...edgeByKey.values()].sort((left, right) => {
		return stableLanguageJson(left).localeCompare(stableLanguageJson(right));
	}));
	const dependents = Object.create(null);
	for (const id of orderedNodeIds) {
		dependents[id] = [];
	}
	for (const edge of edges) {
		dependents[edge.from].push(edge.to);
	}
	for (const id of orderedNodeIds) {
		dependents[id] = Object.freeze([...new Set(dependents[id])]);
	}
	return Object.freeze({
		nodes: Object.freeze(orderedNodeIds.map((id) => Object.freeze({ id }))),
		edges,
		dependents: Object.freeze(dependents)
	});
}

/** Orders unique ids by after authorship, then before authorship, then lexical fallback. */
function orderedIds(ids, beforeSnapshot, afterSnapshot) {
	const uniqueIds = [...new Set(ids.map(String))];
	const order = new Map();
	[...afterSnapshot.definitionOrder, ...beforeSnapshot.definitionOrder].forEach((id) => {
		if (!order.has(id)) {
			order.set(id, order.size);
		}
	});
	return Object.freeze(uniqueIds.sort((left, right) => {
		return (order.get(left) ?? Number.MAX_SAFE_INTEGER) - (order.get(right) ?? Number.MAX_SAFE_INTEGER)
			|| left.localeCompare(right);
	}));
}
