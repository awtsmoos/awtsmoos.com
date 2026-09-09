//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createWebGlGlesObjectReplay } from "../core/android/webglGlesObjectReplay.js";

/** Proves FBO/RBO guest IR creates genuine WebGL containers, storage, attachment, and status calls. */
test("framebuffer IR replays through genuine WebGL2 container methods", () => {
	const calls = [];
	const gl = fakeGl(calls);
	const replay = createWebGlGlesObjectReplay(gl);
	const operations = [
		{ framebuffer: 2, kind: "create-framebuffer" },
		{ framebuffer: 2, kind: "bind-framebuffer", target: 0x8d40 },
		{ kind: "create-renderbuffer", renderbuffer: 3 },
		{ kind: "bind-renderbuffer", renderbuffer: 3, target: 0x8d41 },
		{ height: 32, internalFormat: 0x8058, kind: "renderbuffer-storage", renderbuffer: 3, samples: 0, target: 0x8d41, width: 64 },
		{ attachment: 0x8ce0, framebuffer: 2, kind: "framebuffer-renderbuffer", renderbuffer: 3, renderbufferTarget: 0x8d41, target: 0x8d40 },
		{ framebuffer: 2, kind: "framebuffer-status", status: 0x8cd5, target: 0x8d40 }
	];
	for (const operation of operations) assert.equal(replay.replay(operation).applied, true, operation.kind);
	assert.deepEqual(calls.map(call => call[0]), ["createFramebuffer", "bindFramebuffer", "createRenderbuffer", "bindRenderbuffer", "renderbufferStorage", "framebufferRenderbuffer", "checkFramebufferStatus"]);
});

/** Supplies only the real WebGL2 methods required by the framebuffer replay family. */
function fakeGl(calls) {
	return {
		bindFramebuffer: (...args) => calls.push(["bindFramebuffer", ...args]),
		bindRenderbuffer: (...args) => calls.push(["bindRenderbuffer", ...args]),
		checkFramebufferStatus: target => { calls.push(["checkFramebufferStatus", target]); return 0x8cd5; },
		createFramebuffer: () => { const object = { fbo: 1 }; calls.push(["createFramebuffer", object]); return object; },
		createRenderbuffer: () => { const object = { rbo: 1 }; calls.push(["createRenderbuffer", object]); return object; },
		deleteFramebuffer: object => calls.push(["deleteFramebuffer", object]),
		deleteRenderbuffer: object => calls.push(["deleteRenderbuffer", object]),
		framebufferRenderbuffer: (...args) => calls.push(["framebufferRenderbuffer", ...args]),
		renderbufferStorage: (...args) => calls.push(["renderbufferStorage", ...args])
	};
}
