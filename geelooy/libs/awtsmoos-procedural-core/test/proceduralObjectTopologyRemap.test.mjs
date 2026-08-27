// B"H
// Boruch Hashem
/** Every survivor, merger, and removal is explicit across topology revisions. */

import assert from "node:assert/strict";
import {
	compactGeometryWithIdentity,
	createGeometryArtifact,
	createTopologyIdentityArtifact,
	repairGeometryWithIdentity,
	weldGeometryWithIdentity
} from "../src/core/proceduralObject/index.js";

function makeGeometry(id, positions, indices) {
	return createGeometryArtifact({
		id,
		attributes: { position: { itemSize: 3, array: positions } },
		indices
	});
}

const orphaned = makeGeometry("orphaned", [
	0, 0, 0,
	9, 9, 9,
	1, 0, 0,
	0, 1, 0
], [0, 2, 3]);
const orphanIdentity = createTopologyIdentityArtifact(orphaned, { identitySeed: "orphaned" });
const compacted = compactGeometryWithIdentity(orphaned, orphanIdentity);
assert.equal(compacted.geometry.attributes.position.count, 3);
assert.equal(compacted.identity.revision, 1);
assert.equal(compacted.identity.id, orphanIdentity.id);
assert.equal(compacted.remap.mappings.vertex[orphanIdentity.vertexIds[1]], null);
assert.deepEqual(compacted.identity.vertexIds, [
	orphanIdentity.vertexIds[0],
	orphanIdentity.vertexIds[2],
	orphanIdentity.vertexIds[3]
]);
assert.equal(compacted.identity.faceIds[0], orphanIdentity.faceIds[0]);
assert.deepEqual(
	compacted.identity.edges.map(edge => edge.id).sort(),
	orphanIdentity.edges.map(edge => edge.id).sort()
);

const seam = makeGeometry("seam", [
	0, 0, 0,
	0, 0, 0,
	1, 0, 0,
	0, 1, 0
], [0, 2, 3, 1, 3, 2]);
const seamIdentity = createTopologyIdentityArtifact(seam, { identitySeed: "seam" });
const welded = weldGeometryWithIdentity(seam, seamIdentity, { policy: "position-only" });
const firstTarget = welded.remap.mappings.vertex[seamIdentity.vertexIds[0]];
const secondTarget = welded.remap.mappings.vertex[seamIdentity.vertexIds[1]];
assert.equal(firstTarget, secondTarget);
assert.equal(welded.remap.merged.vertex.length, 1);
assert.deepEqual(welded.remap.merged.vertex[0].sourceIds, [
	seamIdentity.vertexIds[0],
	seamIdentity.vertexIds[1]
].sort());
assert.deepEqual(welded.identity.faceIds, seamIdentity.faceIds);

const damaged = makeGeometry("damaged", [
	0, 0, 0,
	1, 0, 0,
	0, 1, 0,
	2, 0, 0,
	3, 0, 0,
	2, 1, 0,
	9, 9, 9
], [0, 1, 2, 2, 1, 0, 3, 4, 5, 0, 0, 1]);
const damagedIdentity = createTopologyIdentityArtifact(damaged, { identitySeed: "damaged" });
const repaired = repairGeometryWithIdentity(damaged, damagedIdentity);
assert.equal(repaired.geometry.indices.array.length, 6);
assert.equal(repaired.remap.mappings.face[damagedIdentity.faceIds[0]], damagedIdentity.faceIds[0]);
assert.equal(repaired.remap.mappings.face[damagedIdentity.faceIds[1]], null);
assert.equal(repaired.remap.mappings.face[damagedIdentity.faceIds[2]], damagedIdentity.faceIds[2]);
assert.equal(repaired.remap.mappings.face[damagedIdentity.faceIds[3]], null);
assert.equal(repaired.remap.mappings.vertex[damagedIdentity.vertexIds[6]], null);

const repeated = repairGeometryWithIdentity(damaged, damagedIdentity);
assert.equal(repeated.identity.contentHash, repaired.identity.contentHash);
assert.equal(repeated.remap.contentHash, repaired.remap.contentHash);

console.log('B"H | proceduralObjectTopologyRemap.test passed');
