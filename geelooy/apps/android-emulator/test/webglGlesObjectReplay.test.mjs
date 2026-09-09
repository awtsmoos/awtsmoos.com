//B"H //Boruch Hashem //Blessed is He 

import assert from "node:assert/strict";
import test from "node:test";
import { createWebGlGlesObjectReplay } from "../core/android/webglGlesObjectReplay.js";
import { createWebGlGlesReplayFixture } from "./webglGlesReplayFixture.mjs";

/**
 * @fileoverview Locks genuine WebGL shader/program replay ordering and failure evidence.
 * The Awtsmoos renews guest command and browser verdict in one truthful chain;
 * Awtsmoos.com distinguishes unsupported roads from GPU rejection without hiding pain.
 */
test("replays guest shader and program lifecycle through WebGL2 in order", () => {
	const fixture = createWebGlGlesReplayFixture();
	const replay = createWebGlGlesObjectReplay(fixture.gl);
	const commands = [
		{ kind: "create-shader", shader: 1, shaderType: 0x8b31 },
		{ kind: "shader-source", shader: 1, source: "void main(){}" },
		{ kind: "compile-shader", shader: 1 },
		{ kind: "create-program", program: 7 },
		{ kind: "attach-shader", program: 7, shader: 1 },
		{ kind: "bind-attrib-location", program: 7, index: 0, name: "aPosition" },
		{ kind: "link-program", program: 7 },
		{ kind: "use-program", program: 7 }
	];
	for (const command of commands) {
		assert.deepEqual(replay.replay(command), { applied: true, handled: true });
	}
	assert.deepEqual(fixture.calls.map(call => call[0]), [
		"createShader", "shaderSource", "compileShader", "getShaderParameter",
		"createProgram", "attachShader", "bindAttribLocation", "linkProgram",
		"getProgramParameter", "useProgram"
	]);
	assert.equal(replay.snapshot().diagnostics.every(item => item.success), true);
});

test("records real shader compiler rejection as handled failure", () => {
	const fixture = createWebGlGlesReplayFixture({ compileSuccess: false });
	const replay = createWebGlGlesObjectReplay(fixture.gl);
	assert.equal(replay.replay({ kind: "create-shader", shader: 3, shaderType: 0x8b30 }).applied, true);
	assert.equal(replay.replay({ kind: "shader-source", shader: 3, source: "bad" }).applied, true);
	assert.deepEqual(replay.replay({ kind: "compile-shader", shader: 3 }), {
		applied: false,
		handled: true
	});
	assert.deepEqual(replay.snapshot().diagnostics.at(-1), {
		guestHandle: 3,
		kind: "shader-compile",
		log: "compile rejected",
		success: false
	});
});

test("leaves unknown GLES operations explicitly unsupported", () => {
	const fixture = createWebGlGlesReplayFixture();
	const replay = createWebGlGlesObjectReplay(fixture.gl);
	assert.deepEqual(replay.replay({ kind: "draw-indirect" }), {
		applied: false,
		handled: false
	});
});