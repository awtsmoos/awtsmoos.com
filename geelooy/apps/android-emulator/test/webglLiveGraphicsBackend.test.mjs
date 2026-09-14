//B"H //Boruch Hashem //Blessed is He 

import assert from "node:assert/strict";
import test from "node:test";
import { createAndroidGraphicsTrace } from "../core/android/graphicsTrace.js";
import { presentAndroidGraphics } from "../core/android/webglPresenter.js";

/**
 * Proves guest GLES is applied before final presentation and readback comes from
 * the same persistent WebGL2 context rather than a deferred command-history replay.
 */
test("live graphics trace executes immediately and returns real context bytes", () => {
	const calls = [];
	const { canvas } = liveFixture(calls);
	const trace = createAndroidGraphicsTrace({
		devicePixelRatio: 1,
		surfaceHeight: 1,
		surfaceWidth: 2,
		webglCanvas: canvas
	});
	trace.gles({ color: [0.1, 0.2, 0.3, 1], kind: "clear-color" });
	trace.gles({ kind: "clear", mask: 0x4000 });
	assert.ok(calls.some(call => call[0] === "clearColor"));
	assert.ok(calls.some(call => call[0] === "clear"));
	const result = trace.readPixels({
		byteLength: 8,
		format: 0x1908,
		initialBytes: Object.freeze(Array(8).fill(0xaa)),
		height: 1,
		type: 0x1401,
		width: 2,
		x: 0,
		y: 0
	});
	assert.equal(result.success, true);
	assert.deepEqual(result.bytes, [11, 12, 13, 14, 21, 22, 23, 24]);
	assert.equal(trace.snapshot().live.appliedCommandCount, 2);
});

/** Final presentation witnesses the existing GPU state without replaying live GLES twice. */
test("presenter reuses live WebGL history instead of duplicating guest commands", () => {
	const calls = [];
	const { canvas } = liveFixture(calls);
	const options = { devicePixelRatio: 1, surfaceHeight: 1, surfaceWidth: 2, webglCanvas: canvas };
	const trace = createAndroidGraphicsTrace(options);
	trace.gles({ color: [0.2, 0.3, 0.4, 1], kind: "clear-color" });
	trace.gles({ kind: "clear", mask: 0x4000 });
	assert.equal(calls.filter(call => call[0] === "clear").length, 1);
	const evidence = presentAndroidGraphics(canvas, trace.snapshot(), options);
	assert.equal(evidence.liveExecution, true);
	assert.equal(evidence.appliedCommandCount, 2);
	assert.equal(calls.filter(call => call[0] === "clear").length, 1);
});

function liveFixture(calls) {
	const gl = fakeWebGl(calls);
	return Object.freeze({
		canvas: {
			clientHeight: 1,
			clientWidth: 2,
			getContext(type) {
				calls.push(["getContext", type]);
				return gl;
			}
		},
		gl
	});
}

function fakeWebGl(calls) {
	return {
		COLOR_BUFFER_BIT: 0x4000,
		DEPTH_BUFFER_BIT: 0x0100,
		FRAGMENT_SHADER: 0x8b30,
		NO_ERROR: 0,
		RGBA: 0x1908,
		STENCIL_BUFFER_BIT: 0x0400,
		UNSIGNED_BYTE: 0x1401,
		VERTEX_SHADER: 0x8b31,
		clear: mask => calls.push(["clear", mask]),
		clearColor: (...values) => calls.push(["clearColor", ...values]),
		finish: () => calls.push(["finish"]),
		getError: () => 0,
		readPixels(x, y, width, height, format, type, pixels) {
			calls.push(["readPixels", x, y, width, height, format, type]);
			pixels.set([11, 12, 13, 14, 21, 22, 23, 24].slice(0, pixels.length));
		},
		viewport: (...values) => calls.push(["viewport", ...values])
	};
}
