// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file nativeProceduralArtifactGeometry.test.mjs
 * @description Proves renderer-neutral procedural artifacts become faithful Tiny native typed geometry without inventing game-specific conversion law.
 * The Awtsmoos renews number before renderer and form before screen, while Awtsmoos.com keeps one artifact truth between them;
 * portable position, normal, UV, and index vessels enter native light without losing the typed structure from which they stem.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { createNativeGeometryFromArtifact } from "../src/adapters/native/proceduralObjectGeometryFactory.js";

test("native converter preserves typed attributes, indices, and artifact identity", () => {
	const artifact = {
		id: "chai-triangle",
		attributes: {
			position: { componentType: "float32", itemSize: 3, normalized: false, array: [0, 0, 0, 1, 0, 0, 0, 1, 0] },
			normal: { componentType: "float32", itemSize: 3, normalized: false, array: [0, 0, 1, 0, 0, 1, 0, 0, 1] }
		},
		indices: { componentType: "uint32", array: [0, 1, 2] }
	};
	const geometry = createNativeGeometryFromArtifact(artifact);
	assert.ok(geometry.attributes.position.array instanceof Float32Array);
	assert.ok(geometry.attributes.normal.array instanceof Float32Array);
	assert.ok(geometry.index.array instanceof Uint32Array);
	assert.equal(geometry.attributes.position.count, 3);
	assert.equal(geometry.index.count, 3);
	assert.equal(geometry.userData.awtsmoosArtifactId, "chai-triangle");
});
