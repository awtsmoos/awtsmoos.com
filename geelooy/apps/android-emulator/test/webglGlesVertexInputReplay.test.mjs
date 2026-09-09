//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createWebGlGlesObjectReplay } from "../core/android/webglGlesObjectReplay.js";

test("buffer and VAO IR becomes genuine WebGL2 object and attribute calls", () => {
	const calls = [];
	const gl = createFakeGl(calls);
	const replay = createWebGlGlesObjectReplay(gl);
	const operations = [
		{ buffer: 7, kind: "create-buffer" },
		{ buffer: 7, kind: "bind-buffer", target: gl.ARRAY_BUFFER },
		{ bytes: [1, 2, 3, 4], kind: "buffer-data", target: gl.ARRAY_BUFFER, usage: 0x88e4 },
		{ kind: "create-vertex-array", vertexArray: 9 },
		{ kind: "bind-vertex-array", vertexArray: 9 },
		{ buffer: 7, index: 2, integer: false, kind: "vertex-attrib-pointer", normalized: false, offset: 0, size: 2, stride: 8, type: 0x1406 },
		{ index: 2, kind: "enable-vertex-attrib" },
		{ divisor: 3, index: 2, kind: "vertex-attrib-divisor" }
	];
	for (const operation of operations) {
		const result = replay.replay(operation);
		assert.equal(result.handled, true, operation.kind);
		assert.equal(result.applied, true, operation.kind);
	}
	assert.deepEqual(calls.map(call => call[0]), [
		"createBuffer", "bindBuffer", "bufferData", "createVertexArray", "bindVertexArray",
		"bindBuffer", "vertexAttribPointer", "enableVertexAttribArray", "vertexAttribDivisor"
	]);
	assert.deepEqual(calls[2][2], [1, 2, 3, 4]);
});

function createFakeGl(calls) {
	let next = 1;
	return {
		ARRAY_BUFFER: 0x8892,
		bindBuffer: (target, object) => calls.push(["bindBuffer", target, object]),
		bindVertexArray: object => calls.push(["bindVertexArray", object]),
		bufferData: (target, bytes, usage) => calls.push(["bufferData", target, [...bytes], usage]),
		bufferSubData: (target, offset, bytes) => calls.push(["bufferSubData", target, offset, [...bytes]]),
		copyBufferSubData: (...args) => calls.push(["copyBufferSubData", ...args]),
		createBuffer: () => { const value = { id: next++ }; calls.push(["createBuffer", value]); return value; },
		createVertexArray: () => { const value = { id: next++ }; calls.push(["createVertexArray", value]); return value; },
		deleteBuffer: object => calls.push(["deleteBuffer", object]),
		deleteVertexArray: object => calls.push(["deleteVertexArray", object]),
		disableVertexAttribArray: index => calls.push(["disableVertexAttribArray", index]),
		enableVertexAttribArray: index => calls.push(["enableVertexAttribArray", index]),
		vertexAttribDivisor: (index, divisor) => calls.push(["vertexAttribDivisor", index, divisor]),
		vertexAttribIPointer: (...args) => calls.push(["vertexAttribIPointer", ...args]),
		vertexAttribPointer: (...args) => calls.push(["vertexAttribPointer", ...args])
	};
}
