// B"H
// Boruch Hashem
// Blessed is He
/** The Awtsmoos carries topology repair through the same trusted recipe river. */

import assert from "node:assert/strict";
import {
	createProceduralObjectRecipe,
	proceduralObjectCompiler
} from "../src/core/proceduralObject/index.js";

function command(index, id, op, target, args, dependsOn = []) {
	return { index, id, op, target, args, depends_on: dependsOn };
}

function indexedGeometry(positions, indices, extra = {}) {
	return {
		attributes: {
			position: { itemSize: 3, array: positions },
			...extra.attributes
		},
		indices,
		materialSlots: extra.materialSlots ?? []
	};
}

const damaged = indexedGeometry([
	0, 0, 0, 1, 0, 0, 0, 1, 0,
	2, 0, 0, 3, 0, 0, 2, 1, 0,
	9, 9, 9
], [0, 1, 2, 2, 1, 0, 3, 4, 5, 0, 0, 1], {
	attributes: { color: { itemSize: 1, array: [1, 2, 3, 4, 5, 6, 7] } },
	materialSlots: ["stone", "light"]
});
const seam = indexedGeometry([
	0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0
], [0, 2, 3, 1, 3, 2]);
const orphaned = indexedGeometry([
	0, 0, 0, 9, 9, 9, 1, 0, 0, 0, 1, 0
], [0, 2, 3]);

const recipe = createProceduralObjectRecipe({
	recipe_id: "wave-two-geometry-compiler",
	asset: { name: "topology_scene", domain: "generic" },
	commands: [
		command(1, "create_damaged", "create_indexed_geometry", "damaged", damaged),
		command(2, "assign_materials", "assign_face_materials", "assigned", {
			source: "damaged",
			materialIndices: [0, 1, 0, 1]
		}, ["create_damaged"]),
		command(3, "repair", "repair_geometry", "repaired", {
			source: "assigned"
		}, ["assign_materials"]),
		command(4, "create_seam", "create_indexed_geometry", "seam", seam),
		command(5, "weld", "weld_geometry", "welded", {
			source: "seam",
			policy: "position-only",
			tolerance: 0
		}, ["create_seam"]),
		command(6, "create_orphan", "create_indexed_geometry", "orphaned", orphaned),
		command(7, "compact", "compact_geometry", "compacted", {
			source: "orphaned"
		}, ["create_orphan"])
	]
});
const artifact = proceduralObjectCompiler.compile(recipe);

assert.deepEqual(artifact.geometries.assigned.groups, [
	{ start: 0, count: 3, materialIndex: 0 },
	{ start: 3, count: 3, materialIndex: 1 },
	{ start: 6, count: 3, materialIndex: 0 },
	{ start: 9, count: 3, materialIndex: 1 }
]);
assert.equal(artifact.geometries.repaired.id, "repaired");
assert.equal(artifact.geometries.repaired.indices.array.length, 6);
assert.equal(artifact.geometries.repaired.attributes.normal.count, 6);
assert.equal(artifact.geometries.welded.id, "welded");
assert.equal(artifact.geometries.welded.attributes.position.count, 3);
assert.deepEqual(artifact.geometries.welded.indices.array, [0, 1, 2, 0, 2, 1]);
assert.equal(artifact.geometries.compacted.id, "compacted");
assert.equal(artifact.geometries.compacted.attributes.position.count, 3);
assert.deepEqual(artifact.geometries.compacted.indices.array, [0, 1, 2]);
assert.equal(artifact.deferredCommands.length, 0);

console.log('B"H | proceduralObjectGeometryCompiler.test passed');
