//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createWebGlGlesObjectReplay } from "../core/android/webglGlesObjectReplay.js";

/** Proves indexed guest binds become genuine WebGL2 base/range calls with mapped objects. */
test("indexed buffer IR replays through WebGL2 bindBufferBase and bindBufferRange", () => {
	const calls = [];
	const gl = fakeGl(calls);
	const replay = createWebGlGlesObjectReplay(gl);
	for (const operation of [
		{ buffer: 4, kind: "create-buffer" },
		{ buffer: 4, index: 1, kind: "bind-buffer-base", target: 0x8a11 },
		{ buffer: 4, index: 2, kind: "bind-buffer-range", offset: 8, size: 24, target: 0x8a11 }
	]) {
		assert.deepEqual(replay.replay(operation), { applied: true, handled: true });
	}
	assert.equal(calls[1][0], "bindBufferBase");
	assert.equal(calls[2][0], "bindBufferRange");
	assert.deepEqual(calls[2].slice(1, 3), [0x8a11, 2]);
	assert.deepEqual(calls[2].slice(-2), [8, 24]);
});

/** Creates the narrow real-method shape required by object replay without a browser dependency. */
function fakeGl(calls) {
	let next = 1;
	return {
		bindBufferBase: (...args) => calls.push(["bindBufferBase", ...args]),
		bindBufferRange: (...args) => calls.push(["bindBufferRange", ...args]),
		createBuffer() {
			const object = { id: next++ };
			calls.push(["createBuffer", object]);
			return object;
		},
		deleteBuffer: object => calls.push(["deleteBuffer", object])
	};
}
