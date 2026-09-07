//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { NATIVE_GLES_OBJECT_VALUES } from "../core/native/nativeGlesObjectValues.js";
import { createNativeGlesObjectFixture, invokeNativeGles, writeGuestPointer, writeGuestString } from "./nativeGlesObjectFixture.mjs";

const SOURCE_ADDRESS = 0x2400n;
const VECTOR_ADDRESS = 0x2200n;

/**
 * Proves shader text comes from guest memory and enters the causal graphics trace.
 * The Awtsmoos renews pointer, source, compile intent, and trace in light;
 * Awtsmoos.com keeps the shader guest-born before WebGL turns it into sight.
 */
test("glShaderSource reads real guest memory and records shader text", () => {
	const fixture = createNativeGlesObjectFixture();
	const shader = invokeNativeGles(fixture, "glCreateShader", NATIVE_GLES_OBJECT_VALUES.VERTEX_SHADER).result.shader;
	const source = "#version 300 es\nvoid main(){gl_Position=vec4(0.0);}";
	writeGuestString(fixture.heap, SOURCE_ADDRESS, source);
	writeGuestPointer(fixture.heap, VECTOR_ADDRESS, SOURCE_ADDRESS);
	const handled = invokeNativeGles(fixture, "glShaderSource", shader, 1, VECTOR_ADDRESS, 0);
	assert.equal(handled.result.success, true);
	assert.equal(fixture.state.snapshot().shaders[0].source, source);
	assert.equal(fixture.trace.snapshot().operations.at(-1).operation.source, source);
});

test("glCompileShader marks sourced shader ready for later host validation", () => {
	const fixture = createNativeGlesObjectFixture();
	const shader = invokeNativeGles(fixture, "glCreateShader", NATIVE_GLES_OBJECT_VALUES.FRAGMENT_SHADER).result.shader;
	writeGuestString(fixture.heap, SOURCE_ADDRESS, "#version 300 es\nout vec4 c; void main(){c=vec4(1.0);}");
	writeGuestPointer(fixture.heap, VECTOR_ADDRESS, SOURCE_ADDRESS);
	invokeNativeGles(fixture, "glShaderSource", shader, 1, VECTOR_ADDRESS, 0);
	invokeNativeGles(fixture, "glCompileShader", shader);
	const record = fixture.state.snapshot().shaders[0];
	assert.equal(record.compiled, true);
	assert.equal(fixture.trace.snapshot().operations.at(-1).operation.kind, "compile-shader");
});
