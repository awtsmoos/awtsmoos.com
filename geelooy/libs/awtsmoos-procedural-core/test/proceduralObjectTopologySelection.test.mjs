// B"H
// Boruch Hashem
/** Stable selections cross edits by lineage, never by guessed integer position. */

import assert from "node:assert/strict";
import {
	compactGeometryWithIdentity,
	composeTopologyRemaps,
	createGeometryArtifact,
	createSelectionArtifact,
	createTopologyIdentityArtifact,
	createTopologyIdentityReference,
	remapSelectionThroughTopology,
	weldGeometryWithIdentity
} from "../src/core/proceduralObject/index.js";

const geometry = createGeometryArtifact({
	id: "selection-history",
	attributes: {
		position: { itemSize: 3, array: [
			0, 0, 0,
			0, 0, 0,
			1, 0, 0,
			0, 1, 0,
			9, 9, 9
		] }
	},
	indices: [0, 2, 3, 1, 3, 2]
});
const identity = createTopologyIdentityArtifact(geometry, { identitySeed: "selection-history" });
const compacted = compactGeometryWithIdentity(geometry, identity);
const welded = weldGeometryWithIdentity(
	compacted.geometry,
	compacted.identity,
	{ policy: "position-only" }
);
const composed = composeTopologyRemaps(compacted.remap, welded.remap);

const sourceSelection = createSelectionArtifact({
	target: createTopologyIdentityReference(identity),
	domain: "vertex",
	elementIds: [identity.vertexIds[0], identity.vertexIds[1]],
	weights: {
		[identity.vertexIds[0]]: 0.25,
		[identity.vertexIds[1]]: 0.75
	}
});
const afterCompact = remapSelectionThroughTopology(sourceSelection, compacted.remap);
const sequential = remapSelectionThroughTopology(afterCompact, welded.remap);
const direct = remapSelectionThroughTopology(sourceSelection, composed);
assert.deepEqual(direct.elementIds, sequential.elementIds);
assert.deepEqual(direct.weights, sequential.weights);
assert.equal(direct.elementIds.length, 1);
assert.equal(direct.weights[direct.elementIds[0]], 0.75);

const summed = remapSelectionThroughTopology(afterCompact, welded.remap, { weights: "sum" });
const averaged = remapSelectionThroughTopology(afterCompact, welded.remap, { weights: "average" });
assert.equal(summed.weights[summed.elementIds[0]], 1);
assert.equal(averaged.weights[averaged.elementIds[0]], 0.5);

const orphanSelection = createSelectionArtifact({
	target: createTopologyIdentityReference(identity),
	domain: "vertex",
	elementIds: [identity.vertexIds[4]]
});
const dropped = remapSelectionThroughTopology(orphanSelection, compacted.remap);
assert.deepEqual(dropped.elementIds, []);
assert.throws(
	() => remapSelectionThroughTopology(orphanSelection, compacted.remap, { removed: "error" }),
	/was removed/
);

const collapsingEdges = identity.edges.filter(edge => (
	edge.vertexIds.includes(identity.vertexIds[0])
	|| edge.vertexIds.includes(identity.vertexIds[1])
)).filter(edge => edge.vertexIds.includes(identity.vertexIds[2]));
assert.equal(collapsingEdges.length, 2);
const edgeSelection = createSelectionArtifact({
	target: createTopologyIdentityReference(identity),
	domain: "edge",
	elementIds: collapsingEdges.map(edge => edge.id)
});
const compactedEdges = remapSelectionThroughTopology(edgeSelection, compacted.remap);
const weldedEdges = remapSelectionThroughTopology(compactedEdges, welded.remap);
assert.equal(weldedEdges.elementIds.length, 1);

const faceSelection = createSelectionArtifact({
	target: createTopologyIdentityReference(identity),
	domain: "face",
	elementIds: identity.faceIds
});
assert.deepEqual(
	remapSelectionThroughTopology(faceSelection, composed).elementIds,
	[...identity.faceIds].sort()
);
assert.throws(
	() => composeTopologyRemaps(welded.remap, compacted.remap),
	/not consecutive revisions/
);

console.log('B"H | proceduralObjectTopologySelection.test passed');
