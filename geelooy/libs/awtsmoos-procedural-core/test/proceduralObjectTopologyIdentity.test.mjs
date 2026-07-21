// B"H
// Boruch Hashem
/** Persistent topology names outlive the temporary integer seats of geometry. */

import assert from "node:assert/strict";
import {
	assertTopologyIdentityMatchesGeometry,
	createGeometryArtifact,
	createTopologyIdentityArtifact,
	createTopologyIdentityReference,
	hashCanonicalValue
} from "../src/core/proceduralObject/index.js";

function geometry(positions = [
	0, 0, 0,
	1, 0, 0,
	1, 1, 0,
	0, 1, 0,
	9, 9, 9
]) {
	return createGeometryArtifact({
		id: "identity-mesh",
		attributes: { position: { itemSize: 3, array: positions } },
		indices: [0, 1, 2, 0, 2, 3]
	});
}

const mesh = geometry();
const first = createTopologyIdentityArtifact(mesh, { identitySeed: "radiant-square" });
const second = createTopologyIdentityArtifact(mesh, { identitySeed: "radiant-square" });
assert.equal(first.contentHash, second.contentHash);
assert.deepEqual(first.vertexIds, second.vertexIds);
assert.deepEqual(first.faceIds, second.faceIds);
assert.equal(first.vertexIds.length, 5);
assert.equal(first.faceIds.length, 2);
assert.equal(first.edges.length, 5);
assert.equal(new Set(first.vertexIds).size, first.vertexIds.length);
assert.equal(new Set(first.faceIds).size, first.faceIds.length);
assert.equal(new Set(first.edges.map(edge => edge.id)).size, first.edges.length);
assert.equal(first.geometry.contentHash, hashCanonicalValue(mesh));
assert.equal(assertTopologyIdentityMatchesGeometry(first, mesh), first);
assert.equal(Object.isFrozen(first.edges), true);

const reference = createTopologyIdentityReference(first);
assert.equal(reference.artifactId, first.id);
assert.equal(reference.revision, 0);
assert.equal(reference.contentHash, first.contentHash);
assert.equal(reference.kind, "topology-identity");

const changed = geometry([
	0, 0, 0,
	2, 0, 0,
	1, 1, 0,
	0, 1, 0,
	9, 9, 9
]);
assert.throws(
	() => assertTopologyIdentityMatchesGeometry(first, changed),
	/does not match geometry content/
);
assert.throws(
	() => createTopologyIdentityArtifact(mesh, {
		vertexIds: [first.vertexIds[0], first.vertexIds[0], ...first.vertexIds.slice(2)]
	}),
	/must be unique/
);
assert.throws(
	() => createTopologyIdentityArtifact(mesh, { revision: 1, parentRevision: 1 }),
	/must precede revision/
);

console.log('B"H | proceduralObjectTopologyIdentity.test passed');
