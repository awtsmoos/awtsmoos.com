// B"H
// Boruch Hashem
/** Persistent topology products remain immutable inside the final artifact vessel. */

import assert from "node:assert/strict";
import {
	createGeometryArtifact,
	createProceduralArtifact,
	createSelectionArtifact,
	createTopologyIdentityArtifact,
	createTopologyIdentityReference,
	createTopologyRemapArtifact
} from "../src/core/proceduralObject/index.js";

const geometry = createGeometryArtifact({
	id: "artifact-mesh",
	attributes: {
		position: { itemSize: 3, array: [0, 0, 0, 1, 0, 0, 0, 1, 0] }
	},
	indices: [0, 1, 2]
});
const identity = createTopologyIdentityArtifact(geometry, { identitySeed: "artifact" });
const reference = createTopologyIdentityReference(identity);
const mappings = {
	vertex: Object.fromEntries(identity.vertexIds.map(id => [id, id])),
	edge: Object.fromEntries(identity.edges.map(edge => [edge.id, edge.id])),
	face: Object.fromEntries(identity.faceIds.map(id => [id, id]))
};
const remap = createTopologyRemapArtifact({
	operation: "identity_artifact_test",
	source: identity,
	target: identity,
	mappings
});
const selection = createSelectionArtifact({
	target: reference,
	domain: "face",
	elementIds: identity.faceIds
});
const artifact = createProceduralArtifact({
	geometries: { [geometry.id]: geometry },
	topologyIdentities: { topology: identity },
	topologyRemaps: { remap },
	selections: { selected: selection }
});

assert.equal(artifact.topologyIdentities.topology.contentHash, identity.contentHash);
assert.equal(artifact.topologyRemaps.remap.contentHash, remap.contentHash);
assert.equal(artifact.selections.selected.id, selection.id);
assert.equal(Object.isFrozen(artifact.topologyIdentities), true);
assert.equal(Object.isFrozen(artifact.topologyIdentities.topology.vertexIds), true);
assert.equal(Object.isFrozen(artifact.topologyRemaps.remap.mappings.vertex), true);
assert.equal(Object.isFrozen(artifact.selections.selected.elementIds), true);

const empty = createProceduralArtifact();
assert.deepEqual(empty.topologyIdentities, {});
assert.deepEqual(empty.topologyRemaps, {});
assert.deepEqual(empty.selections, {});

console.log('B"H | proceduralObjectTopologyArtifact.test passed');
