// B"H

import { createStableId } from "../../../foundation/artifacts/index.js";
import { topologyEdgeKey } from "./deriveTopologyEdges.js";

export function validateTargetIndexMap(values, sourceCount, targetCount, label) {
	if (!Array.isArray(values) || values.length !== sourceCount) {
		throw new RangeError(`${label} must match source topology count.`);
	}
	return Object.freeze(values.map(value => {
		if (value == null) return null;
		if (!Number.isInteger(value) || value < 0 || value >= targetCount) {
			throw new RangeError(`${label} contains an invalid target index.`);
		}
		return value;
	}));
}

export function createTargetElementIds(sourceIds, targetIndexBySource, targetCount, namespace, seed) {
	const sourcesByTarget = Array.from({ length: targetCount }, () => []);
	targetIndexBySource.forEach((targetIndex, sourceIndex) => {
		if (targetIndex != null) sourcesByTarget[targetIndex].push(sourceIds[sourceIndex]);
	});
	return Object.freeze(sourcesByTarget.map((sourceIds, targetIndex) => (
		sourceIds[0] ?? createStableId(namespace, { seed, targetIndex })
	)));
}

export function createElementMapping(sourceIds, targetIndexBySource, targetIds) {
	return Object.freeze(Object.fromEntries(sourceIds.map((sourceId, sourceIndex) => [
		sourceId,
		targetIndexBySource[sourceIndex] == null
			? null
			: targetIds[targetIndexBySource[sourceIndex]]
	])));
}

export function createPreservedEdgeIds(sourceIdentity, vertexMapping) {
	const edgeIdsByKey = {};
	for (const edge of sourceIdentity.edges) {
		const targets = edge.vertexIds.map(vertexId => vertexMapping[vertexId]);
		if (targets.some(value => value == null) || targets[0] === targets[1]) continue;
		const key = topologyEdgeKey(targets[0], targets[1]);
		if (edgeIdsByKey[key] == null || edge.id < edgeIdsByKey[key]) {
			edgeIdsByKey[key] = edge.id;
		}
	}
	return Object.freeze(edgeIdsByKey);
}

export function createEdgeMapping(sourceIdentity, targetIdentity, vertexMapping) {
	const targetByKey = new Map(targetIdentity.edges.map(edge => [edge.key, edge.id]));
	return Object.freeze(Object.fromEntries(sourceIdentity.edges.map(edge => {
		const targets = edge.vertexIds.map(vertexId => vertexMapping[vertexId]);
		const targetId = targets.some(value => value == null) || targets[0] === targets[1]
			? null
			: targetByKey.get(topologyEdgeKey(targets[0], targets[1])) ?? null;
		return [edge.id, targetId];
	})));
}
