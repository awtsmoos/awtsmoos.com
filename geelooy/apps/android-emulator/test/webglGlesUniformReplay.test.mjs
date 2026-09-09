//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createWebGlGlesObjectReplay } from "../core/android/webglGlesObjectReplay.js";

/** Proves synthetic guest locations become opaque WebGL locations and drive real uniform methods. */
test("uniform location/value IR replays through genuine WebGL2 methods", () => {
	const calls = [];
	const gl = fakeGl(calls);
	const replay = createWebGlGlesObjectReplay(gl);
	for (const operation of [
		{ kind: "create-program", program: 7 },
		{ kind: "get-uniform-location", location: 12, name: "uTint", program: 7 },
		{ kind: "uniform-value", location: 12, method: "uniform4f", values: [1, 0.5, 0.25, 1] },
		{ array: true, kind: "uniform-value", location: 12, matrix: true, method: "uniformMatrix2fv", values: [1, 0, 0, 1] }
	]) assert.equal(replay.replay(operation).applied, true, operation.kind);
	assert.deepEqual(calls.map(call => call[0]), ["createProgram", "getUniformLocation", "uniform4f", "uniformMatrix2fv"]);
	assert.deepEqual(calls[2].slice(2), [1, 0.5, 0.25, 1]);
	assert.deepEqual(calls[3][3], [1, 0, 0, 1]);
});

/** Builds only the genuine WebGL2 methods required by this uniform replay contract. */
function fakeGl(calls) {
	return {
		createProgram() { const value = { program: 1 }; calls.push(["createProgram", value]); return value; },
		getUniformLocation(program, name) { const value = { name }; calls.push(["getUniformLocation", program, name, value]); return value; },
		uniform4f: (location, ...values) => calls.push(["uniform4f", location, ...values]),
		uniformMatrix2fv(location, transpose, values) {
			calls.push(["uniformMatrix2fv", location, transpose, [...values]]);
		}
	};
}
