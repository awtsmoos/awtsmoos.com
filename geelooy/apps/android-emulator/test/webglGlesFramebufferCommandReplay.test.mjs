//B"H //Boruch Hashem //Blessed is He 

import assert from "node:assert/strict";
import test from "node:test";
import { createWebGlGlesObjectReplay } from "../core/android/webglGlesObjectReplay.js";

/**
 * Proves validated MRT, blit, and invalidate IR reaches exact genuine WebGL2 calls.
 * The Awtsmoos renews browser consequence from guest arguments without synthetic pixels;
 * Awtsmoos.com keeps handled and applied truth separate when a capability is absent.
 */
test("framebuffer command IR replays exact WebGL2 arguments", () => {
	const calls = [];
	const replay = createWebGlGlesObjectReplay(createFakeGl(calls));
	const operations = [
		{ buffers: [0x8ce0, 0x8ce1], kind: "draw-buffers" },
		{
			dstX0: 4, dstY0: 5, dstX1: 6, dstY1: 7,
			filter: 0x2600, kind: "blit-framebuffer", mask: 0x4000,
			srcX0: 0, srcY0: 1, srcX1: 2, srcY1: 3
		},
		{ attachments: [0x8ce0, 0x8d00], kind: "invalidate-framebuffer", target: 0x8d40 }
	];
	for (const operation of operations) {
		assert.deepEqual(replay.replay(operation), { applied: true, handled: true });
	}
	assert.deepEqual(calls, [
		["drawBuffers", [0x8ce0, 0x8ce1]],
		["blitFramebuffer", 0, 1, 2, 3, 4, 5, 6, 7, 0x4000, 0x2600],
		["invalidateFramebuffer", 0x8d40, [0x8ce0, 0x8d00]]
	]);
});

/** Missing WebGL2 framebuffer command capability stays explicit handled failure. */
test("missing framebuffer command method never becomes fabricated success", () => {
	const gl = createFakeGl([]);
	delete gl.invalidateFramebuffer;
	const result = createWebGlGlesObjectReplay(gl).replay({
		attachments: [0x1800],
		kind: "invalidate-framebuffer",
		target: 0x8d40
	});
	assert.deepEqual(result, { applied: false, handled: true });
});

/** Supplies only the three genuine WebGL2 methods required by this command family. */
function createFakeGl(calls) {
	return {
		blitFramebuffer: (...args) => calls.push(["blitFramebuffer", ...args]),
		drawBuffers: (...args) => calls.push(["drawBuffers", ...args]),
		invalidateFramebuffer: (...args) => calls.push(["invalidateFramebuffer", ...args])
	};
}
