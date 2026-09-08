//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { registerNativeGlesTextureCommandHandlers } from "../core/native/nativeGlesTextureCommandHandlers.js";
import { registerNativeGlesTextureSubImageHandlers } from "../core/native/nativeGlesTextureSubImageHandlers.js";
import { createNativeGlesTextureFixture, invokeTextureGles } from "./nativeGlesTextureFixture.mjs";

const T2D = 0x0de1;
const RGBA = 0x1908;
const UBYTE = 0x1401;
const OUT = 0x3000n;
const PTR = 0x3400n;
const STACK = 0x5000n;

/** The Awtsmoos renews texture parameter, storage, subimage and mipmap ABI while Awtsmoos.com freezes real guest state. */
test("texture parameters and immutable storage trace exact bound texture", () => {
	const fixture = familyFixture();
	const texture = generate(fixture);
	invokeTextureGles(fixture, "glBindTexture", T2D, texture);
	assert.equal(invokeTextureGles(fixture, "glTexParameteri", T2D, 0x2801, 0x2601).result.success, true);
	assert.equal(invokeTextureGles(fixture, "glTexStorage2D", T2D, 1, 0x8058, 8, 4).result.success, true);
	assert.equal(invokeTextureGles(fixture, "glGenerateMipmap", T2D).result.success, true);
	const kinds = fixture.trace.snapshot().operations.slice(-3).map(entry => entry.operation.kind);
	assert.deepEqual(kinds, ["texture-parameter", "tex-storage-2d", "generate-mipmap"]);
});

test("texture subimage reads ninth argument from guest stack and freezes bytes", () => {
	const fixture = familyFixture();
	const texture = generate(fixture);
	invokeTextureGles(fixture, "glBindTexture", T2D, texture);
	const pixels = Uint8Array.from([9, 8, 7, 6]);
	fixture.memory.write(PTR, pixels);
	fixture.registers.sp = STACK;
	const slot = new Uint8Array(8);
	new DataView(slot.buffer).setBigUint64(0, PTR, true);
	fixture.memory.write(STACK, slot);
	fixture.registers.pc = 0x8899n;
	[T2D, 0, 1, 2, 1, 1, RGBA, UBYTE].forEach((value, index) => fixture.registers.write(index, BigInt(value)));
	fixture.registers.write(30, 0x7788n);
	const handled = fixture.registry.handle({ name: "glTexSubImage2D" }, fixture);
	assert.equal(handled.result.success, true);
	const operation = fixture.trace.snapshot().operations.at(-1).operation;
	assert.equal(operation.kind, "tex-sub-image-2d");
	assert.deepEqual(operation.pixels, Array.from(pixels));
	assert.equal(operation.texture, texture);
});

function familyFixture() {
	const fixture = createNativeGlesTextureFixture();
	registerNativeGlesTextureCommandHandlers(fixture.registry, fixture.state);
	registerNativeGlesTextureSubImageHandlers(fixture.registry, fixture.state);
	return fixture;
}

function generate(fixture) {
	invokeTextureGles(fixture, "glGenTextures", 1n, OUT);
	const bytes = fixture.memory.read(OUT, 4);
	return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(0, true);
}
