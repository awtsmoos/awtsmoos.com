// B"H

import { createTopologyIdentityArtifact } from "./createTopologyIdentityArtifact.js";
import { createTopologyRemapArtifact } from "./createTopologyRemapArtifact.js";
import { assertTopologyIdentityMatchesGeometry } from "./identityContract.js";
import {
	createEdgeMapping,
	createElementMapping,
	createPreservedEdgeIds,
	createTargetElementIds,
	validateTargetIndexMap
} from "./transitionMapping.js";

/**
 * Creates the next identity revision and the exact lineage connecting both worlds.
 */
export function createIdentityTransition(input) {
	const sourceIdentity = assertTopologyIdentityMatchesGeometry(
		input.sourceIdentity,
		input.sourceGeometry
	);
	const targetVertexCount = input.targetGeometry.attributes.position.count;
	const targetFaceCount = input.targetGeometry.indices.array.length / 3;
	const vertexTargets = validateTargetIndexMap(
		input.vertexTargetBySource,
		sourceIdentity.vertexIds.length,
		targetVertexCount,
		"Vertex transition map"
	);
	const faceTargets = validateTargetIndexMap(
		input.faceTargetBySource,
		sourceIdentity.faceIds.length,
		targetFaceCount,
		"Face transition map"
	);
	const revision = input.revision ?? sourceIdentity.revision + 1;
	const vertexIds = createTargetElementIds(
		sourceIdentity.vertexIds,
		vertexTargets,
		targetVertexCount,
		"vertex",
		{ topologyId: sourceIdentity.id, revision, operation: input.operation }
	);
	const faceIds = createTargetElementIds(
		sourceIdentity.faceIds,
		faceTargets,
		targetFaceCount,
		"face",
		{ topologyId: sourceIdentity.id, revision, operation: input.operation }
	);
	const vertexMapping = createElementMapping(
		sourceIdentity.vertexIds,
		vertexTargets,
		vertexIds
	);
	const targetIdentity = createTopologyIdentityArtifact(input.targetGeometry, {
		id: sourceIdentity.id,
		revision,
		parentRevision: sourceIdentity.revision,
		vertexIds,
		faceIds,
		edgeIdsByKey: createPreservedEdgeIds(sourceIdentity, vertexMapping),
		metadata: input.metadata
	});
	const faceMapping = createElementMapping(
		sourceIdentity.faceIds,
		faceTargets,
		faceIds
	);
	const remap = createTopologyRemapArtifact({
		operation: input.operation,
		source: sourceIdentity,
		target: targetIdentity,
		mappings: {
			vertex: vertexMapping,
			edge: createEdgeMapping(sourceIdentity, targetIdentity, vertexMapping),
			face: faceMapping
		},
		metadata: input.remapMetadata
	});
	return Object.freeze({ identity: targetIdentity, remap });
}
