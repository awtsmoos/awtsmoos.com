//B"H //Boruch Hashem //Blessed is He 

/**
 * @fileoverview Proves guest draw IR executes the matching genuine WebGL2 methods.
 * The Awtsmoos.com route preserves primitive, index, range, offset, and instance
 * arguments exactly; a missing browser method is handled but never called success.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { createWebGlGlesObjectReplay } from "../core/android/webglGlesObjectReplay.js";

const TRIANGLES = 0x0004;
const UNSIGNED_SHORT = 0x1403;

test("direct draw IR becomes exact genuine WebGL2 calls", () => {
	const calls = [];
	const replay = createWebGlGlesObjectReplay(createFakeGl(calls));
	const operations = [
		{ count: 3, first: 0, kind: "draw-arrays", mode: TRIANGLES },
		{ count: 6, first: 2, instanceCount: 4, kind: "draw-arrays-instanced", mode: TRIANGLES },
		{ count: 6, kind: "draw-elements", mode: TRIANGLES, offset: 2, type: UNSIGNED_SHORT },
		{ count: 6, instanceCount: 3, kind: "draw-elements-instanced", mode: TRIANGLES, offset: 4, type: UNSIGNED_SHORT },
		{ count: 6, kind: "draw-range-elements", mode: TRIANGLES, offset: 0, range: { end: 8, start: 1 }, type: UNSIGNED_SHORT }
	];
	for (const operation of operations) {
		const result = replay.replay(operation);
		assert.deepEqual(result, { applied: true, handled: true }, operation.kind);
	}
	assert.deepEqual(calls, [
		["drawArrays", TRIANGLES, 0, 3],
		["drawArraysInstanced", TRIANGLES, 2, 6, 4],
		["drawElements", TRIANGLES, 6, UNSIGNED_SHORT, 2],
		["drawElementsInstanced", TRIANGLES, 6, UNSIGNED_SHORT, 4, 3],
		["drawRangeElements", TRIANGLES, 1, 8, 6, UNSIGNED_SHORT, 0]
	]);
});

test("missing direct WebGL draw capability never becomes fabricated success", () => {
	const replay = createWebGlGlesObjectReplay(createFakeGl([]));
	const gl = createFakeGl([]);
	delete gl.drawRangeElements;
	const unavailable = createWebGlGlesObjectReplay(gl).replay({
		count: 2,
		kind: "draw-range-elements",
		mode: TRIANGLES,
		offset: 0,
		range: { end: 1, start: 0 },
		type: UNSIGNED_SHORT
	});
	assert.deepEqual(unavailable, { applied: false, handled: true });
	assert.equal(replay.replay({ kind: "draw-indirect" }).handled, false);
});

/** Builds a deterministic WebGL2-shaped witness for direct draw methods only. */
function createFakeGl(calls) {
	return {
		drawArrays: (...argumentsList) => calls.push(["drawArrays", ...argumentsList]),
		drawArraysInstanced: (...argumentsList) => calls.push(["drawArraysInstanced", ...argumentsList]),
		drawElements: (...argumentsList) => calls.push(["drawElements", ...argumentsList]),
		drawElementsInstanced: (...argumentsList) => calls.push(["drawElementsInstanced", ...argumentsList]),
		drawRangeElements: (...argumentsList) => calls.push(["drawRangeElements", ...argumentsList])
	};
}
