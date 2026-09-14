//B"H
//Boruch Hashem
//Blessed be He

import assert from "node:assert/strict";
import test from "node:test";
import { registerNativeGles2FramebufferQueryHandlers } from "../core/native/nativeGles2FramebufferQueryHandlers.js";
import { registerNativeGles2ShaderBinaryHandlers } from "../core/native/nativeGles2ShaderBinaryHandlers.js";
import { registerNativeGles2TextureImageHandlers } from "../core/native/nativeGles2TextureImageHandlers.js";
import { registerNativeGles2TextureQueryHandlers } from "../core/native/nativeGles2TextureQueryHandlers.js";
import { registerNativeGlesTextureCommandHandlers } from "../core/native/nativeGlesTextureCommandHandlers.js";
import { NATIVE_GLES_COLOR_ATTACHMENT0, NATIVE_GLES_FRAMEBUFFER, NATIVE_GLES_RENDERBUFFER } from "../core/native/nativeGlesFramebufferValues.js";
import { NATIVE_GLES_STRING_VALUES } from "../core/native/nativeGlesQueryValues.js";
import { createNativeGlesFramebufferFixture, invokeFramebuffer } from "./nativeGlesFramebufferFixture.mjs";
import { createNativeGlesObjectFixture, GUEST_THREAD, invokeNativeGles } from "./nativeGlesObjectFixture.mjs";
import { createNativeGlesTextureFixture, invokeTextureGles, TEXTURE_GUEST_THREAD } from "./nativeGlesTextureFixture.mjs";

const OUTPUT = 0x3000n;
const TEXTURE_2D = 0x0de1;

/** Proves generated texture identity begins only after the first successful bind. */
test("GLES2 texture identity and parameter queries retain real state", () => {
	const fixture = createNativeGlesTextureFixture();
	registerNativeGles2TextureQueryHandlers(fixture.registry, fixture.state);
	registerNativeGlesTextureCommandHandlers(fixture.registry, fixture.state);
	const texture = generateTexture(fixture);
	assert.equal(invokeTextureGles(fixture, "glIsTexture", texture).result.value, 0);
	invokeTextureGles(fixture, "glBindTexture", TEXTURE_2D, texture);
	assert.equal(invokeTextureGles(fixture, "glIsTexture", texture).result.value, 1);
	invokeTextureGles(fixture, "glTexParameteri", TEXTURE_2D, 0x2801, 0x2600);
	invokeTextureGles(fixture, "glGetTexParameteriv", TEXTURE_2D, 0x2801, OUTPUT);
	assert.equal(readInt(fixture.memory, OUTPUT), 0x2600);
});

/** Proves GLES2 framebuffer and renderbuffer metadata are guest-queryable. */
test("GLES2 framebuffer queries return retained attachment and storage metadata", () => {
	const fixture = createNativeGlesFramebufferFixture();
	registerNativeGles2FramebufferQueryHandlers(fixture.registry, fixture.state);
	const framebuffer = generateObject(fixture, "Framebuffers");
	const renderbuffer = generateObject(fixture, "Renderbuffers");
	invokeFramebuffer(fixture, "glBindFramebuffer", NATIVE_GLES_FRAMEBUFFER, framebuffer);
	invokeFramebuffer(fixture, "glBindRenderbuffer", NATIVE_GLES_RENDERBUFFER, renderbuffer);
	invokeFramebuffer(fixture, "glRenderbufferStorage", NATIVE_GLES_RENDERBUFFER, 0x8056, 64, 32);
	invokeFramebuffer(fixture, "glFramebufferRenderbuffer", NATIVE_GLES_FRAMEBUFFER, NATIVE_GLES_COLOR_ATTACHMENT0, NATIVE_GLES_RENDERBUFFER, renderbuffer);
	invokeFramebuffer(fixture, "glGetRenderbufferParameteriv", NATIVE_GLES_RENDERBUFFER, 0x8d42, OUTPUT);
	assert.equal(readInt(fixture.memory, OUTPUT), 64);
	invokeFramebuffer(fixture, "glGetFramebufferAttachmentParameteriv", NATIVE_GLES_FRAMEBUFFER, NATIVE_GLES_COLOR_ATTACHMENT0, 0x8cd1, OUTPUT);
	assert.equal(readInt(fixture.memory, OUTPUT), renderbuffer);
});

/** Proves copy operations enter the real graphics trace and unsupported formats fail honestly. */
test("GLES2 copy and compressed-image calls preserve causal/error behavior", () => {
	const fixture = createNativeGlesTextureFixture();
	registerNativeGles2TextureImageHandlers(fixture.registry, fixture.state);
	const texture = generateTexture(fixture);
	invokeTextureGles(fixture, "glBindTexture", TEXTURE_2D, texture);
	const copied = invokeTextureGles(fixture, "glCopyTexImage2D", TEXTURE_2D, 0, 0x1908, 0, 0, 16, 16, 0);
	assert.equal(copied.result.success, true);
	assert.equal(fixture.trace.snapshot().operations.at(-1).operation.kind, "copy-tex-image-2d");
	invokeTextureGles(fixture, "glCompressedTexImage2D", TEXTURE_2D, 0);
	assert.equal(fixture.state.domain.takeError(TEXTURE_GUEST_THREAD), NATIVE_GLES_STRING_VALUES.INVALID_ENUM);
});

/** Proves shader binary API is present but rejects formats when none are advertised. */
test("GLES2 shader binary reports unsupported-format error", () => {
	const fixture = createNativeGlesObjectFixture();
	registerNativeGles2ShaderBinaryHandlers(fixture.registry, fixture.state);
	assert.equal(invokeNativeGles(fixture, "glShaderBinary", 1).result.success, false);
	assert.equal(fixture.state.domain.takeError(GUEST_THREAD), NATIVE_GLES_STRING_VALUES.INVALID_ENUM);
});

function generateTexture(fixture) {
	invokeTextureGles(fixture, "glGenTextures", 1, OUTPUT);
	return readUint(fixture.memory, OUTPUT);
}

function generateObject(fixture, family) {
	invokeFramebuffer(fixture, `glGen${family}`, 1, OUTPUT);
	return readUint(fixture.memory, OUTPUT);
}

function readInt(memory, address) {
	const bytes = memory.read(address, 4);
	return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getInt32(0, true);
}

function readUint(memory, address) {
	return readInt(memory, address) >>> 0;
}
