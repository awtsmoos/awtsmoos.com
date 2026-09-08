//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createWebGlGlesObjectReplay } from "../core/android/webglGlesObjectReplay.js";

const T2D = 0x0de1;
const RGBA = 0x1908;
const UBYTE = 0x1401;

/**
 * Proves the authentic texture/sampler family becomes genuine ordered WebGL2 calls.
 * The Awtsmoos renews textures, samplers, storage, mipmaps and guest bytes while Awtsmoos.com invents nothing.
 */
test("texture commands replay on the mapped WebGL2 texture", () => {
	const fixture = createFamilyGl();
	const replay = createWebGlGlesObjectReplay(fixture.gl);
	assert.equal(replay.replay({ kind: "create-texture", texture: 7 }).applied, true);
	assert.equal(replay.replay({ kind: "texture-parameter", pname: 0x2801, target: T2D, texture: 7, value: 0x2601, valueType: "int" }).applied, true);
	assert.equal(replay.replay({ height: 4, internalFormat: 0x8058, kind: "tex-storage-2d", levels: 1, target: T2D, texture: 7, width: 8 }).applied, true);
	assert.equal(replay.replay({ bindingTarget: T2D, format: RGBA, height: 1, kind: "tex-sub-image-2d", level: 0, pixels: [1, 2, 3, 4], target: T2D, texture: 7, type: UBYTE, width: 1, xoffset: 2, yoffset: 3 }).applied, true);
	assert.equal(replay.replay({ kind: "generate-mipmap", target: T2D, texture: 7 }).applied, true);
	assert.deepEqual(fixture.calls.slice(1).map(call => call[0]), [
		"bindTexture", "texParameteri", "bindTexture", "texStorage2D",
		"bindTexture", "texSubImage2D", "bindTexture", "generateMipmap"
	]);
	const subimage = fixture.calls.find(call => call[0] === "texSubImage2D");
	assert.deepEqual(Array.from(subimage.at(-1)), [1, 2, 3, 4]);
});

test("sampler lifecycle and parameters replay on distinct WebGLSampler objects", () => {
	const fixture = createFamilyGl();
	const replay = createWebGlGlesObjectReplay(fixture.gl);
	assert.equal(replay.replay({ kind: "create-sampler", sampler: 3 }).applied, true);
	assert.equal(replay.snapshot().samplerCount, 1);
	assert.equal(replay.replay({ kind: "bind-sampler", sampler: 3, unit: 2 }).applied, true);
	assert.equal(replay.replay({ kind: "sampler-parameter", pname: 0x2801, sampler: 3, value: 0x2601, valueType: "int" }).applied, true);
	assert.equal(replay.replay({ kind: "delete-sampler", sampler: 3 }).applied, true);
	assert.equal(replay.snapshot().samplerCount, 0);
	assert.deepEqual(fixture.calls.map(call => call[0]), [
		"createSampler", "bindSampler", "samplerParameteri", "deleteSampler"
	]);
});

function createFamilyGl() {
	const calls = [];
	const textures = [];
	const samplers = [];
	return {
		calls,
		gl: {
			bindSampler(unit, sampler) { calls.push(["bindSampler", unit, sampler]); },
			bindTexture(target, texture) { calls.push(["bindTexture", target, texture]); },
			createSampler() {
				const sampler = Object.freeze({ sampler: samplers.length + 1 });
				samplers.push(sampler); calls.push(["createSampler", sampler]); return sampler;
			},
			createTexture() {
				const texture = Object.freeze({ texture: textures.length + 1 });
				textures.push(texture); calls.push(["createTexture", texture]); return texture;
			},
			deleteSampler(sampler) { calls.push(["deleteSampler", sampler]); },
			generateMipmap(target) { calls.push(["generateMipmap", target]); },
			samplerParameteri(sampler, pname, value) { calls.push(["samplerParameteri", sampler, pname, value]); },
			texParameteri(target, pname, value) { calls.push(["texParameteri", target, pname, value]); },
			texStorage2D(...args) { calls.push(["texStorage2D", ...args]); },
			texSubImage2D(...args) { calls.push(["texSubImage2D", ...args]); }
		}
	};
}
