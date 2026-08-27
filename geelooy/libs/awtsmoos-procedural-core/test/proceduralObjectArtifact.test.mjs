// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews each test vessel so truth, not confidence, decides
 * whether Awtsmoos.com procedural form is ready to enter the world.
 */

import assert from "node:assert/strict";

import {
	createGeometryArtifact,
	createProceduralArtifact
} from "../src/core/proceduralObject/index.js";
import {
	createAwtsmoosObjectRuntime
} from "../src/adapters/awtsmoos/index.js";

const geometry = createGeometryArtifact({
	id: "points",
	topology: "points",
	attributes: {
		position: {
			itemSize: 3,
			componentType: "float64",
			array: [0, 0, 0, 1, 2, 3]
		},
		temperature: {
			itemSize: 1,
			componentType: "float32",
			array: [0.25, 0.75]
		},
		selection: {
			itemSize: 1,
			componentType: "uint8",
			normalized: true,
			array: [0, 255]
		}
	},
	morphTargets: {
		expanded: {
			position: {
				itemSize: 3,
				componentType: "float64",
				array: [0, 0, 0, 2, 4, 6]
			}
		}
	},
	morphTargetsRelative: false,
	drawRange: {
		start: 0,
		count: 2
	}
});
const artifact = createProceduralArtifact({
	recipe_id: "artifact",
	geometries: {
		points: geometry
	},
	objects: {
		points_object: {
			id: "points_object",
			geometryId: "points"
		}
	},
	rootObjectIds: ["points_object"]
});
const runtime = createAwtsmoosObjectRuntime(artifact);

assert.equal(runtime.geometries.points.attributes.position.array instanceof Float64Array, true);
assert.equal(runtime.geometries.points.attributes.selection.array instanceof Uint8Array, true);
assert.equal(runtime.geometries.points.topology, "points");
assert.equal(runtime.artifact.geometries.points.morphTargets.expanded.position.itemSize, 3);

console.log('B"H | proceduralObjectArtifact.test passed');
