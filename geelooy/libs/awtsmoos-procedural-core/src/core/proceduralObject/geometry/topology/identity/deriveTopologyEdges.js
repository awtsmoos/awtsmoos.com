// B"H

import {
	assertStableId,
	createStableId
} from "../../../foundation/artifacts/index.js";
import { buildEdgeIncidence } from "../edgeIncidence.js";

export function topologyEdgeKey(leftId, rightId) {
	return leftId < rightId
		? `${leftId}|${rightId}`
		: `${rightId}|${leftId}`;
}

/** Derives stable edge records from endpoint identities and triangle incidence. */
export function deriveTopologyEdges(geometry, vertexIds, faceIds, options = {}) {
	const edgeIdsByKey = options.edgeIdsByKey ?? {};
	const identitySeed = options.identitySeed;
	return Object.freeze(buildEdgeIncidence(geometry.indices.array)
		.map(edge => {
			const vertexPair = edge.vertices
				.map(index => vertexIds[index])
				.sort();
			const key = topologyEdgeKey(vertexPair[0], vertexPair[1]);
			const id = edgeIdsByKey[key] == null
				? createStableId("edge", { identitySeed, key })
				: assertStableId(edgeIdsByKey[key], `Edge id for ${key}`);
			return Object.freeze({
				id,
				key,
				vertexIds: Object.freeze(vertexPair),
				faceIds: Object.freeze(edge.faces.map(faceIndex => faceIds[faceIndex]))
			});
		})
		.sort((left, right) => left.key < right.key ? -1 : left.key > right.key ? 1 : 0));
}
