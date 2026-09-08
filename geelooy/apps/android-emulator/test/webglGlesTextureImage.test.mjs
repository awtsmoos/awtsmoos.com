//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createWebGlGlesObjectReplay } from "../core/android/webglGlesObjectReplay.js";

const TEXTURE_2D = 0x0de1;
const RGBA = 0x1908;
const UNSIGNED_BYTE = 0x1401;

/**
 * Proves guest texture images become genuine WebGL2 uploads without host image substitution.
 * The Awtsmoos renews byte and default-texture vessels while Awtsmoos.com preserves ordered causality.
 */
test("named texture replays exact bytes and pixel-store order", () => {
	const fixture = createTextureGl();
	const replay = createWebGlGlesObjectReplay(fixture.gl);
	replay.replay({ kind: "create-texture", texture: 7 });
	replay.replay({ kind: "pixel-store", param: 1, pname: 0x0cf5 });
	assert.equal(replay.replay(image(7, [1, 2, 3, 4, 5, 6, 7, 8])).applied, true);
	assert.deepEqual(fixture.calls[1], ["pixelStorei", 0x0cf5, 1]);
	assert.deepEqual(fixture.calls[2], ["bindTexture", TEXTURE_2D, fixture.textures[0]]);
	const upload = fixture.calls[3];
	assert.equal(upload[0], "texImage2D");
	assert.equal(upload[9] instanceof Uint8Array, true);
	assert.deepEqual(Array.from(upload[9]), [1, 2, 3, 4, 5, 6, 7, 8]);
});

test("null allocation and default texture zero preserve GLES semantics", () => {
	const named = createTextureGl();
	const namedReplay = createWebGlGlesObjectReplay(named.gl);
	namedReplay.replay({ kind: "create-texture", texture: 4 });
	assert.equal(namedReplay.replay(image(4, null)).applied, true);
	assert.equal(named.calls.at(-1)[9], null);
	const defaults = createTextureGl();
	const defaultReplay = createWebGlGlesObjectReplay(defaults.gl);
	assert.equal(defaultReplay.replay(image(0, [9, 8, 7, 6])).applied, true);
	assert.equal(defaults.textures.length, 1);
	assert.deepEqual(defaults.calls[1], ["bindTexture", TEXTURE_2D, defaults.textures[0]]);
	assert.notEqual(defaults.calls[1][2], null);
});

function image(texture, pixels) {
	return Object.freeze({
		bindingTarget: TEXTURE_2D,
		border: 0,
		format: RGBA,
		height: 1,
		internalFormat: RGBA,
		kind: "tex-image-2d",
		level: 0,
		pixels,
		target: TEXTURE_2D,
		texture,
		type: UNSIGNED_BYTE,
		width: pixels?.length === 4 ? 1 : 2
	});
}

function createTextureGl() {
	const calls = [];
	const textures = [];
	return {
		calls,
		textures,
		gl: {
			bindTexture(target, texture) { calls.push(["bindTexture", target, texture]); },
			createTexture() {
				const texture = Object.freeze({ id: textures.length + 1 });
				textures.push(texture);
				calls.push(["createTexture", texture]);
				return texture;
			},
			pixelStorei(pname, param) { calls.push(["pixelStorei", pname, param]); },
			texImage2D(...args) { calls.push(["texImage2D", ...args]); }
		}
	};
}
