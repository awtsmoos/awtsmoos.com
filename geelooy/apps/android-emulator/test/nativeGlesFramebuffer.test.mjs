//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createFlutterJniImportHandlers } from "../core/native/flutterJniImportHandlers.js";
import { NATIVE_GLES_COLOR_ATTACHMENT0, NATIVE_GLES_FRAMEBUFFER, NATIVE_GLES_FRAMEBUFFER_COMPLETE, NATIVE_GLES_FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT, NATIVE_GLES_RENDERBUFFER } from "../core/native/nativeGlesFramebufferValues.js";
import { createNativeGlesFramebufferFixture, invokeFramebuffer } from "./nativeGlesFramebufferFixture.mjs";

const OUTPUT = 0x3000n;
const RGBA8 = 0x8058;

/** Proves generated framebuffer names become objects only after bind and start incomplete. */
test("framebuffer lifecycle preserves generated-versus-created semantics", () => {
	const fixture = createNativeGlesFramebufferFixture();
	const framebuffer = generate(fixture, "Framebuffers");
	assert.equal(invokeFramebuffer(fixture, "glIsFramebuffer", framebuffer).result.result, 0);
	assert.equal(invokeFramebuffer(fixture, "glBindFramebuffer", NATIVE_GLES_FRAMEBUFFER, framebuffer).result.success, true);
	assert.equal(invokeFramebuffer(fixture, "glIsFramebuffer", framebuffer).result.result, 1);
	assert.equal(invokeFramebuffer(fixture, "glCheckFramebufferStatus", NATIVE_GLES_FRAMEBUFFER).result.status, NATIVE_GLES_FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT);
});

/** Proves allocated renderbuffer storage and attachment make the guest FBO complete. */
test("renderbuffer storage attachment completes framebuffer", () => {
	const fixture = createNativeGlesFramebufferFixture();
	const framebuffer = generate(fixture, "Framebuffers");
	const renderbuffer = generate(fixture, "Renderbuffers");
	invokeFramebuffer(fixture, "glBindFramebuffer", NATIVE_GLES_FRAMEBUFFER, framebuffer);
	invokeFramebuffer(fixture, "glBindRenderbuffer", NATIVE_GLES_RENDERBUFFER, renderbuffer);
	assert.equal(invokeFramebuffer(fixture, "glRenderbufferStorage", NATIVE_GLES_RENDERBUFFER, RGBA8, 64, 32).result.success, true);
	assert.equal(invokeFramebuffer(fixture, "glFramebufferRenderbuffer", NATIVE_GLES_FRAMEBUFFER, NATIVE_GLES_COLOR_ATTACHMENT0, NATIVE_GLES_RENDERBUFFER, renderbuffer).result.success, true);
	assert.equal(invokeFramebuffer(fixture, "glCheckFramebufferStatus", NATIVE_GLES_FRAMEBUFFER).result.status, NATIVE_GLES_FRAMEBUFFER_COMPLETE);
});

/** Proves the real production registry exposes core and multisample framebuffer families once. */
test("production registry exposes framebuffer families", () => {
	const registry = createFlutterJniImportHandlers(Object.freeze({ javaVmAddress: 0x5000n, jniEnvironment: Object.freeze({ environmentAddress: "21504" }) }));
	const names = registry.snapshot();
	for (const name of ["glGenFramebuffers", "glBindFramebuffer", "glCheckFramebufferStatus", "glGenRenderbuffers", "glRenderbufferStorage", "glRenderbufferStorageMultisample", "glFramebufferRenderbuffer", "glFramebufferTexture2D"]) assert.equal(names.filter(item => item === name).length, 1, name);
});

/** Generates one container name through guest memory and reads its GLuint result. */
function generate(fixture, family) {
	invokeFramebuffer(fixture, `glGen${family}`, 1, OUTPUT);
	const bytes = fixture.memory.read(OUTPUT, 4);
	return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(0, true);
}
