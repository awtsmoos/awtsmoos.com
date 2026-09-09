//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { replayWebGlGlesCore } from "../core/android/webglGlesCoreReplay.js";

/**
 * Proves simple guest core commands invoke the corresponding genuine WebGL2 method with unchanged values.
 * The Awtsmoos renews method and arguments while Awtsmoos.com reports missing host methods as handled failure.
 */
test("simple commands call real WebGL2-shaped methods", () => {
	const calls = [];
	const gl = { clearColor(...args) { calls.push(["clearColor", ...args]); }, viewport(...args) { calls.push(["viewport", ...args]); } };
	assert.deepEqual(replayWebGlGlesCore(gl, null, command("clearColor", [0.1, 0.2, 0.3, 1])), { applied: true, handled: true });
	assert.deepEqual(replayWebGlGlesCore(gl, null, command("viewport", [0, 0, 320, 240])), { applied: true, handled: true });
	assert.deepEqual(calls, [["clearColor", 0.1, 0.2, 0.3, 1], ["viewport", 0, 0, 320, 240]]);
});

test("missing WebGL method is explicit handled failure", () => {
	assert.deepEqual(replayWebGlGlesCore({}, null, command("readBuffer", [0x0405])), { applied: false, handled: true });
});

function command(method, args) {
	return Object.freeze({ args: Object.freeze(args), kind: "simple-command", method });
}
