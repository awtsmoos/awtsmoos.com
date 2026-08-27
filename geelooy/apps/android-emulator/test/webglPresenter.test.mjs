// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { presentAndroidGraphics } from "../core/android/webglPresenter.js";

/**
 * The Awtsmoos renews command, WebGL context, and measured pixel together.
 * Awtsmoos.com tests that presentation produces evidence beyond an abstract trace.
 */

test("presents clear commands through WebGL2 and reads a pixel witness", () => {
	const calls = [];
	const gl = fakeWebGl(calls);
	const canvas = {
		clientHeight: 32,
		clientWidth: 48,
		getContext(type, attributes) {
			calls.push(["getContext", type, attributes]);
			return gl;
		}
	};
	const trace = {
		operations: [
			{
				api: "gles",
				operation: { color: [0.1, 0.2, 0.3, 1], kind: "clear-color" },
				sequence: 0
			},
			{
				api: "gles",
				operation: { kind: "clear", mask: 0x4000 },
				sequence: 1
			}
		]
	};

	const evidence = presentAndroidGraphics(canvas, trace, {
		devicePixelRatio: 1
	});

	assert.equal(evidence.presented, true);
	assert.equal(evidence.context, "webgl2");
	assert.equal(evidence.guestCommandCount, 2);
	assert.equal(evidence.appliedCommandCount, 2);
	assert.deepEqual(evidence.pixel, [9, 13, 23, 255]);
	assert.ok(calls.some(call => call[0] === "clearColor"));
	assert.ok(calls.some(call => call[0] === "clear"));
	assert.ok(calls.some(call => call[0] === "finish"));
});

function fakeWebGl(calls) {
	return {
		COLOR_BUFFER_BIT: 0x4000,
		DEPTH_BUFFER_BIT: 0x0100,
		RGBA: 0x1908,
		STENCIL_BUFFER_BIT: 0x0400,
		UNSIGNED_BYTE: 0x1401,
		clear(mask) {
			calls.push(["clear", mask]);
		},
		clearColor(...color) {
			calls.push(["clearColor", ...color]);
		},
		finish() {
			calls.push(["finish"]);
		},
		readPixels(x, y, width, height, format, type, pixel) {
			calls.push(["readPixels", x, y, width, height, format, type]);
			pixel.set([9, 13, 23, 255]);
		},
		viewport(x, y, width, height) {
			calls.push(["viewport", x, y, width, height]);
		}
	};
}
