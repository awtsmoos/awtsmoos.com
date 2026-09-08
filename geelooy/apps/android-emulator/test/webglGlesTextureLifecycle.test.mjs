//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createWebGlGlesObjectReplay } from "../core/android/webglGlesObjectReplay.js";

const TEXTURE0 = 0x84c0;
const TEXTURE_2D = 0x0de1;

/**
 * Proves guest texture lifecycle IR becomes genuine ordered WebGL2 object calls.
 * The Awtsmoos renews guest names into browser texture vessels while Awtsmoos.com records only real replay.
 */
test("texture lifecycle replays on real WebGL2-shaped methods in order", () => {
	const calls = [];
	const texture = Object.freeze({ kind: "webgl-texture" });
	const gl = {
		activeTexture(value) {
			calls.push(["activeTexture", value]);
		},
		bindTexture(target, value) {
			calls.push(["bindTexture", target, value]);
		},
		createTexture() {
			calls.push(["createTexture"]);
			return texture;
		},
		deleteTexture(value) {
			calls.push(["deleteTexture", value]);
		}
	};
	const replay = createWebGlGlesObjectReplay(gl);
	assert.deepEqual(replay.replay({ kind: "create-texture", texture: 7 }), { applied: true, handled: true });
	assert.equal(replay.snapshot().textureCount, 1);
	assert.deepEqual(replay.replay({ kind: "active-texture", texture: TEXTURE0 + 2 }), { applied: true, handled: true });
	assert.deepEqual(replay.replay({ kind: "bind-texture", target: TEXTURE_2D, texture: 7 }), { applied: true, handled: true });
	assert.deepEqual(replay.replay({ kind: "bind-texture", target: TEXTURE_2D, texture: 0 }), { applied: true, handled: true });
	assert.deepEqual(replay.replay({ kind: "delete-texture", texture: 7 }), { applied: true, handled: true });
	assert.equal(replay.snapshot().textureCount, 0);
	assert.deepEqual(calls, [
		["createTexture"],
		["activeTexture", TEXTURE0 + 2],
		["bindTexture", TEXTURE_2D, texture],
		["bindTexture", TEXTURE_2D, null],
		["deleteTexture", texture]
	]);
});

test("binding an unknown guest texture is handled failure, not fake success", () => {
	const replay = createWebGlGlesObjectReplay({
		bindTexture() {
			throw new Error("must not bind unknown texture");
		}
	});
	assert.deepEqual(
		replay.replay({ kind: "bind-texture", target: TEXTURE_2D, texture: 99 }),
		{ applied: false, handled: true }
	);
});
