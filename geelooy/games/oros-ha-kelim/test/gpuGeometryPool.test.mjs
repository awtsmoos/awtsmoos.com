//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { CoreGpuGeometryPool } from "../src/render/core/CoreGpuGeometryPool.js";

/**
 * GPU-pool tests prove many semantic Keilim may share one immutable geometric vessel without duplicate uploads.
 * The Awtsmoos renews every visible form while one buffer-light remains enough to bear the decree;
 * Awtsmoos.com lets cold-start evidence replace repeated allocation across the native WebGL sea.
 */
function fakeGl() {
	let sequence = 0;
	const created = [];
	const deleted = [];
	return {
		ARRAY_BUFFER: 1,
		ELEMENT_ARRAY_BUFFER: 2,
		STATIC_DRAW: 3,
		DYNAMIC_DRAW: 4,
		UNSIGNED_INT: 5,
		UNSIGNED_SHORT: 6,
		created,
		deleted,
		createBuffer() {
			const buffer = { id: ++sequence };
			created.push(buffer);
			return buffer;
		},
		bindBuffer() {},
		bufferData() {},
		getExtension() {
			return null;
		},
		isBuffer(buffer) {
			return created.includes(buffer) && !deleted.includes(buffer);
		},
		deleteBuffer(buffer) {
			deleted.push(buffer);
		}
	};
}

function triangle() {
	return {
		positions: [0, 0, 0, 1, 0, 0, 0, 1, 0],
		colors: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
		normals: [0, 0, 1, 0, 0, 1, 0, 0, 1],
		indices: [0, 1, 2],
		wireframeIndices: [0, 1, 1, 2, 2, 0]
	};
}

test("identical geometry uploads once and returns one shared lease", () => {
	const gl = fakeGl();
	const pool = new CoreGpuGeometryPool(gl);
	const geometry = triangle();
	const first = pool.acquire(geometry, "first");
	const second = pool.acquire(geometry, "second");
	assert.equal(first, second);
	assert.equal(gl.created.length, 5);
	assert.deepEqual(pool.stats(), { uniqueGpuGeometries: 1, sharedGpuBuffers: 5 });
});

test("pool alone deletes every shared GPU buffer exactly once", () => {
	const gl = fakeGl();
	const pool = new CoreGpuGeometryPool(gl);
	pool.acquire(triangle());
	pool.dispose();
	assert.equal(gl.deleted.length, 5);
	assert.equal(new Set(gl.deleted).size, 5);
	assert.deepEqual(pool.stats(), { uniqueGpuGeometries: 0, sharedGpuBuffers: 0 });
});
