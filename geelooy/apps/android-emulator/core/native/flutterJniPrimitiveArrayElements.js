//B"H
//Boruch Hashem
//Blessed be He

import { findJniPrimitiveArraySpec } from "./flutterJniPrimitiveArraySpecs.js";
import {
	jniPrimitiveArrayError,
	requireJniPrimitiveArray,
	resumeJniPrimitiveArray,
	validateJniPrimitiveArrayEnvironment
} from "./flutterJniPrimitiveArraySupport.js";

/**
 * Returns a tracked guest-native copy for one typed or critical primitive array.
 * @param {object} context Active native import context.
 * @param {object} machineState Persistent JNI machine state.
 * @param {object} copies Copy-lifetime state shared by registration family.
 * @param {?object} suppliedSpec Typed specification or null for critical access.
 * @param {boolean} critical Whether this is JNI critical access.
 */
export function getJniPrimitiveArrayElements(
	context,
	machineState,
	copies,
	suppliedSpec,
	critical
) {
	const registers = context.registers;
	validateJniPrimitiveArrayEnvironment(registers, machineState);
	const handle = registers.read(1, 64, "zero");
	const array = requireJniPrimitiveArray(machineState, handle);
	const spec = resolveSpec(array.descriptor, suppliedSpec);
	const isCopyPointer = registers.read(2, 64, "zero");
	const pointer = copies.acquire(machineState, array, spec, isCopyPointer);
	registers.write(0, pointer, 64, "zero");
	resumeJniPrimitiveArray(registers);
	return Object.freeze({
		critical,
		descriptor: spec.descriptor,
		handle: handle.toString(),
		operation: critical ? "GetPrimitiveArrayCritical" : `Get${spec.stem}ArrayElements`,
		pointer: pointer.toString()
	});
}

/** Releases one tracked elements/critical copy under JNI commit/abort semantics. */
export function releaseJniPrimitiveArrayElements(
	context,
	machineState,
	copies,
	suppliedSpec,
	critical
) {
	const registers = context.registers;
	validateJniPrimitiveArrayEnvironment(registers, machineState);
	const handle = registers.read(1, 64, "zero");
	const array = requireJniPrimitiveArray(machineState, handle);
	const spec = resolveSpec(array.descriptor, suppliedSpec);
	const pointer = registers.read(2, 64, "zero");
	const mode = registers.read(3, 32, "zero");
	const result = copies.release(machineState, array, spec, pointer, mode);
	resumeJniPrimitiveArray(registers);
	return Object.freeze({
		...result,
		critical,
		descriptor: spec.descriptor,
		handle: handle.toString(),
		operation: critical
			? "ReleasePrimitiveArrayCritical"
			: `Release${spec.stem}ArrayElements`,
		pointer: pointer.toString()
	});
}

function resolveSpec(descriptor, suppliedSpec) {
	const spec = suppliedSpec || findJniPrimitiveArraySpec(descriptor);
	if (!spec || spec.descriptor !== descriptor) {
		throw jniPrimitiveArrayError(
			"JNI_PRIMITIVE_ARRAY_TYPE",
			`${descriptor}:${suppliedSpec?.descriptor || "critical"}`
		);
	}
	return spec;
}
