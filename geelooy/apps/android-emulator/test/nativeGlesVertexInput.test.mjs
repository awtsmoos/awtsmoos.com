//B"H
//Boruch Hashem
//Blessed is He

/**
 * @fileoverview Proves guest buffers and VAOs obey GLES lifetime, binding, and byte-causality rules.
 * The Awtsmoos keeps shared buffer records distinct from context-local vertex arrays and their state;
 * Awtsmoos.com demands exact guest memory evidence before those commands may reach browser WebGL2.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { createFlutterJniImportHandlers } from "../core/native/flutterJniImportHandlers.js";
import { NATIVE_GLES_ARRAY_BUFFER, NATIVE_GLES_ELEMENT_ARRAY_BUFFER } from "../core/native/nativeGlesBufferTargets.js";
import { createNativeGlesVertexInputFixture, invokeVertexInput, VERTEX_RETURN } from "./nativeGlesVertexInputFixture.mjs";

const OUTPUT = 0x3000n;
const DATA = 0x3200n;
const FLOAT = 0x1406;
const STATIC_DRAW = 0x88e4;

test("buffer lifecycle preserves exact guest upload and subdata bytes", () => {
	const fixture = createNativeGlesVertexInputFixture();
	const buffer = generateBuffer(fixture);
	assert.equal(invokeVertexInput(fixture, "glIsBuffer", buffer).result.result, 0);
	assert.equal(invokeVertexInput(fixture, "glBindBuffer", NATIVE_GLES_ARRAY_BUFFER, buffer).result.success, true);
	assert.equal(invokeVertexInput(fixture, "glIsBuffer", buffer).result.result, 1);
	fixture.memory.write(DATA, new Uint8Array([1, 2, 3, 4]));
	assert.equal(invokeVertexInput(fixture, "glBufferData", NATIVE_GLES_ARRAY_BUFFER, 4, DATA, STATIC_DRAW).result.success, true);
	fixture.memory.write(DATA, new Uint8Array([9, 8]));
	assert.equal(invokeVertexInput(fixture, "glBufferSubData", NATIVE_GLES_ARRAY_BUFFER, 1, 2, DATA).result.success, true);
	assert.deepEqual([...fixture.state.buffers.boundRecord(fixture.context, NATIVE_GLES_ARRAY_BUFFER).bytes], [1, 9, 8, 4]);
	assert.equal(fixture.registers.pc, VERTEX_RETURN);
});

test("VAO captures attribute buffer reference and survives buffer-name deletion", () => {
	const fixture = createNativeGlesVertexInputFixture();
	const buffer = generateBuffer(fixture);
	const vao = generateVao(fixture);
	assert.equal(invokeVertexInput(fixture, "glIsVertexArray", vao).result.result, 0);
	invokeVertexInput(fixture, "glBindVertexArray", vao);
	assert.equal(invokeVertexInput(fixture, "glIsVertexArray", vao).result.result, 1);
	invokeVertexInput(fixture, "glBindBuffer", NATIVE_GLES_ARRAY_BUFFER, buffer);
	assert.equal(invokeVertexInput(fixture, "glVertexAttribPointer", 2, 2, FLOAT, 0, 8, 0).result.success, true);
	invokeVertexInput(fixture, "glEnableVertexAttribArray", 2);
	invokeVertexInput(fixture, "glVertexAttribDivisor", 2, 3);
	const attribute = fixture.state.contexts.get(fixture.context).currentVao.attributes.get(2);
	assert.equal(attribute.buffer.handle, buffer);
	assert.equal(attribute.enabled, true);
	assert.equal(attribute.divisor, 3);
	writeName(fixture, buffer);
	invokeVertexInput(fixture, "glDeleteBuffers", 1, OUTPUT);
	assert.equal(invokeVertexInput(fixture, "glIsBuffer", buffer).result.result, 0);
	assert.equal(attribute.buffer.handle, buffer);
});

test("element array buffer binding remains VAO local", () => {
	const fixture = createNativeGlesVertexInputFixture();
	const buffer = generateBuffer(fixture);
	const first = generateVao(fixture);
	const second = generateVao(fixture);
	invokeVertexInput(fixture, "glBindVertexArray", first);
	invokeVertexInput(fixture, "glBindBuffer", NATIVE_GLES_ELEMENT_ARRAY_BUFFER, buffer);
	assert.equal(fixture.state.buffers.boundRecord(fixture.context, NATIVE_GLES_ELEMENT_ARRAY_BUFFER).handle, buffer);
	invokeVertexInput(fixture, "glBindVertexArray", second);
	assert.equal(fixture.state.buffers.boundRecord(fixture.context, NATIVE_GLES_ELEMENT_ARRAY_BUFFER), null);
	invokeVertexInput(fixture, "glBindVertexArray", first);
	assert.equal(fixture.state.buffers.boundRecord(fixture.context, NATIVE_GLES_ELEMENT_ARRAY_BUFFER).handle, buffer);
});

test("production registry exposes the new buffer and VAO families exactly once", () => {
	const registry = createFlutterJniImportHandlers(Object.freeze({ javaVmAddress: 0x5000n, jniEnvironment: Object.freeze({ environmentAddress: "21504" }) }));
	const names = registry.snapshot();
	for (const name of ["glBindBuffer", "glBufferData", "glBufferSubData", "glCopyBufferSubData", "glGenBuffers", "glBindVertexArray", "glVertexAttribPointer", "glVertexAttribIPointer", "glVertexAttribDivisor"]) {
		assert.equal(names.filter(candidate => candidate === name).length, 1, name);
	}
});

/** Generates one guest buffer name through the real native ABI handler. */
function generateBuffer(fixture) {
	invokeVertexInput(fixture, "glGenBuffers", 1, OUTPUT);
	return readName(fixture);
}
/** Generates one guest VAO name through the real native ABI handler. */
function generateVao(fixture) {
	invokeVertexInput(fixture, "glGenVertexArrays", 1, OUTPUT);
	return readName(fixture);
}
/** Reads a GLuint written by the emulator into guest memory. */
function readName(fixture) {
	const bytes = fixture.memory.read(OUTPUT, 4);
	return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(0, true);
}
/** Writes a GLuint deletion list into guest memory without host identity leakage. */
function writeName(fixture, name) {
	const bytes = new Uint8Array(4);
	new DataView(bytes.buffer).setUint32(0, name, true);
	fixture.memory.write(OUTPUT, bytes);
}
