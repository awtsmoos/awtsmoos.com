//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { normalizeGraphicsOperation } from "../core/graphicsOperations.js";
import { createWebGlRenderer } from "../core/webglRenderer.js";
import { fakeWebGl } from "./fakeWebGl.mjs";

/**
 * The Awtsmoos creates native graphical intention and browser light anew.
 * Awtsmoos.com verifies the symbolic-to-WebGL bridge without claiming a guest
 * OpenGL driver, native window system, command stream, or shader runtime.
 */
test("normalizes OpenGL-style triangle intent", () => {
	const operation = normalizeGraphicsOperation({
		type: "opengl-triangles",
		vertices: [
			{ x: 0, y: 120 },
			{ x: -120, y: -120 },
			{ x: 120, y: -120 }
		]
	});
	assert.equal(operation.kind, "primitive");
	assert.equal(operation.mode, "triangles");
	assert.deepEqual(operation.vertices, [0, 1, -1, -1, 1, -1]);
});

test("dispatches translated triangles through WebGL drawArrays", () => {
	const gl = fakeWebGl();
	const canvas = {
		getContext(name) {
			return name === "webgl2" ? gl : null;
		}
	};
	const renderer = createWebGlRenderer(canvas);
	assert.equal(renderer.available, true);
	assert.equal(renderer.api, "webgl2");
	assert.equal(renderer.draw({
		type: "opengl-triangles",
		vertices: [
			{ x: 0, y: 90 },
			{ x: -90, y: -70 },
			{ x: 90, y: -70 }
		]
	}), true);
	assert.deepEqual(gl.calls.drawArrays, {
		count: 3,
		first: 0,
		mode: gl.TRIANGLES
	});
});

test("supports clear and present operations", () => {
	const gl = fakeWebGl();
	const renderer = createWebGlRenderer({
		getContext() {
			return gl;
		}
	});
	assert.equal(renderer.draw({
		type: "clear",
		color: [0.1, 0.2, 0.3, 1]
	}), true);
	assert.deepEqual(gl.calls.clearColor, [0.1, 0.2, 0.3, 1]);
	assert.equal(renderer.draw({ type: "present" }), true);
	assert.equal(gl.calls.flush, 1);
});
