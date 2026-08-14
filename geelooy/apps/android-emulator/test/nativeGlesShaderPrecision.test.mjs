//B"H //Boruch Hashem //Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createFlutterJniImportHandlers } from "../core/native/flutterJniImportHandlers.js";
import { NATIVE_GLES_SHADER_PRECISION_VALUES as PRECISION } from "../core/native/nativeGlesShaderPrecisionValues.js";
import { NATIVE_GLES_STRING_VALUES } from "../core/native/nativeGlesStringState.js";
import {
	createNativeGlesShaderPrecisionFixture,
	invokeNativeGlesPrecision,
	PRECISION_RETURN_ADDRESS,
	readNativeInt32,
	writeNativeCString
} from "./nativeGlesShaderPrecisionFixture.mjs";

const PROFILES = [
	[PRECISION.LOW_FLOAT, [8, 8], 8],
	[PRECISION.MEDIUM_FLOAT, [14, 14], 10],
	[PRECISION.HIGH_FLOAT, [127, 127], 23],
	[PRECISION.LOW_INT, [8, 7], 0],
	[PRECISION.MEDIUM_INT, [15, 14], 0],
	[PRECISION.HIGH_INT, [31, 30], 0]
];

/**
 * Proves the authentic Flutter precision query through actual AArch64 registers.
 * The Awtsmoos renews high guest addresses, exponent, and X30 returning ray;
 * Awtsmoos.com keeps host pointers absent while guest bytes reveal the way.
 */
test("authentic fragment high-float query writes exact guest values", () => {
	const fixture = createNativeGlesShaderPrecisionFixture({
		heapBase: 123136716670000n,
		heapSize: 0x4000
	});
	const precisionDestination = 123136716673396n;
	const rangeDestination = 123136716673400n;
	fixture.heap.write(precisionDestination, Uint8Array.of(9, 9, 9, 9));
	fixture.heap.write(rangeDestination, Uint8Array.of(8, 8, 8, 8, 8, 8, 8, 8));
	fixture.registers.write(5, 0xabcden);
	const handled = invokeNativeGlesPrecision(
		fixture,
		"glGetShaderPrecisionFormat",
		35632,
		36338,
		rangeDestination,
		precisionDestination
	);
	assert.deepEqual(handled.result.range, [127, 127]);
	assert.equal(handled.result.precision, 23);
	assert.deepEqual([...fixture.heap.read(rangeDestination, 8)], [127, 0, 0, 0, 127, 0, 0, 0]);
	assert.deepEqual([...fixture.heap.read(precisionDestination, 4)], [23, 0, 0, 0]);
	assert.equal(fixture.registers.read(0, 32), 35632n);
	assert.equal(fixture.registers.read(1, 32), 36338n);
	assert.equal(fixture.registers.read(2), rangeDestination);
	assert.equal(fixture.registers.read(3), precisionDestination);
	assert.equal(fixture.registers.read(5), 0xabcden);
	assert.equal(fixture.registers.pc, PRECISION_RETURN_ADDRESS);
});

test("both shader stages expose all six software precision profiles", () => {
	const fixture = createNativeGlesShaderPrecisionFixture();
	for (const shaderType of [PRECISION.VERTEX_SHADER, PRECISION.FRAGMENT_SHADER]) {
		for (const [precisionType, range, precision] of PROFILES) {
			const rangeDestination = fixture.heap.allocate(8n);
			const precisionDestination = fixture.heap.allocate(4n);
			invokeNativeGlesPrecision(
				fixture,
				"glGetShaderPrecisionFormat",
				shaderType,
				precisionType,
				rangeDestination,
				precisionDestination
			);
			assert.deepEqual([
				readNativeInt32(fixture.heap, rangeDestination),
				readNativeInt32(fixture.heap, rangeDestination + 4n)
			], range);
			assert.equal(readNativeInt32(fixture.heap, precisionDestination), precision);
		}
	}
});

test("invalid enums and missing contexts preserve output and expose errors", () => {
	const fixture = createNativeGlesShaderPrecisionFixture();
	const range = fixture.heap.allocate(8n);
	const precision = fixture.heap.allocate(4n);
	fixture.heap.write(range, Uint8Array.of(1, 2, 3, 4, 5, 6, 7, 8));
	fixture.heap.write(precision, Uint8Array.of(9, 10, 11, 12));
	invokeNativeGlesPrecision(fixture, "glGetShaderPrecisionFormat", 0xdead, PRECISION.HIGH_FLOAT, range, precision);
	assert.deepEqual([...fixture.heap.read(range, 8)], [1, 2, 3, 4, 5, 6, 7, 8]);
	assert.deepEqual([...fixture.heap.read(precision, 4)], [9, 10, 11, 12]);
	assert.equal(invokeNativeGlesPrecision(fixture, "glGetError").result.error, NATIVE_GLES_STRING_VALUES.INVALID_ENUM);
	invokeNativeGlesPrecision(fixture, "glGetShaderPrecisionFormat", PRECISION.FRAGMENT_SHADER, 0xbeef, range, precision);
	assert.equal(invokeNativeGlesPrecision(fixture, "glGetError").result.error, NATIVE_GLES_STRING_VALUES.INVALID_ENUM);
	const unbound = createNativeGlesShaderPrecisionFixture({ bindCurrent: false });
	const otherRange = unbound.heap.allocate(8n);
	const otherPrecision = unbound.heap.allocate(4n);
	invokeNativeGlesPrecision(unbound, "glGetShaderPrecisionFormat", PRECISION.FRAGMENT_SHADER, PRECISION.HIGH_FLOAT, otherRange, otherPrecision);
	assert.equal(invokeNativeGlesPrecision(unbound, "glGetError").result.error, NATIVE_GLES_STRING_VALUES.INVALID_OPERATION);
});

test("dynamic and production registries expose the precision query once", () => {
	const fixture = createNativeGlesShaderPrecisionFixture();
	const name = fixture.heap.allocate(64n);
	writeNativeCString(fixture.heap, name, "glGetShaderPrecisionFormat");
	const resolved = invokeNativeGlesPrecision(fixture, "eglGetProcAddress", name);
	assert.equal(fixture.imports.find(BigInt(resolved.result.address)).name, "glGetShaderPrecisionFormat");
	assert.equal(fixture.registry.snapshot().filter(value => value === "glGetShaderPrecisionFormat").length, 1);
	const production = createFlutterJniImportHandlers(Object.freeze({
		javaVmAddress: 0x5000n,
		jniEnvironment: Object.freeze({ environmentAddress: "21504" })
	}));
	assert.equal(production.snapshot().filter(value => value === "glGetShaderPrecisionFormat").length, 1);
});
