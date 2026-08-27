//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { CoreMesh } from "../src/render/core/CoreMesh.js";

/**
 * CoreMesh ownership tests prove semantic removal never destroys geometry shared by sibling Keilim.
 * The Awtsmoos renews each meaning while the common geometric vessel remains outside its hand;
 * Awtsmoos.com lets trail segments vanish without deleting buffers another visible form still needs to stand.
 */
test("semantic mesh disposal releases references without deleting shared buffers", () => {
	let deleted = 0;
	const gl = {
		deleteBuffer() {
			deleted += 1;
		}
	};
	const gpuGeometry = {
		buffers: { position: { id: 1 }, indices: { id: 2 } },
		indicesCount: 3
	};
	const mesh = new CoreMesh(gl, "shared-keli", gpuGeometry, [1, 1, 1, 1]);
	mesh.dispose();
	assert.equal(deleted, 0);
	assert.equal(mesh.buffers, null);
	assert.equal(mesh.gpuGeometry, null);
});
