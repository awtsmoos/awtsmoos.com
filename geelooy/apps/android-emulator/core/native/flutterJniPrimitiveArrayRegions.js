//B"H
//Boruch Hashem
//Blessed be He

import {
	decodeJniPrimitiveValue,
	encodeJniPrimitiveValue,
	jniPrimitiveSpanBytes
} from "./flutterJniPrimitiveArrayCodec.js";
import {
	readJniArraySize,
	requireJniPrimitiveArray,
	resumeJniPrimitiveArray,
	validateJniPrimitiveArrayEnvironment,
	validateJniPrimitiveArrayRange,
	validateJniPrimitiveMemory
} from "./flutterJniPrimitiveArraySupport.js";

/** Copies one typed Java primitive region into caller-owned guest-native memory. */
export function getJniPrimitiveArrayRegion(context, machineState, spec) {
	const values = readRegionArguments(context, machineState, spec);
	const byteLength = jniPrimitiveSpanBytes(spec, values.count);
	validateJniPrimitiveMemory(machineState, values.pointer, byteLength);
	if (byteLength > 0) {
		const bytes = new Uint8Array(byteLength);
		for (let offset = 0; offset < values.count; offset += 1) {
			bytes.set(
				encodeJniPrimitiveValue(
					spec,
					values.array.capabilities.readArrayElement(
						values.array.reference.target,
						values.start + offset
					)
				),
				offset * spec.bytes
			);
		}
		machineState.memory.write(values.pointer, bytes);
	}
	return finishRegion(context, spec, values, "Get");
}

/** Copies caller-owned native primitive bytes back into one Java array region. */
export function setJniPrimitiveArrayRegion(context, machineState, spec) {
	const values = readRegionArguments(context, machineState, spec);
	const byteLength = jniPrimitiveSpanBytes(spec, values.count);
	validateJniPrimitiveMemory(machineState, values.pointer, byteLength);
	if (byteLength > 0) {
		const bytes = machineState.memory.read(values.pointer, byteLength);
		for (let offset = 0; offset < values.count; offset += 1) {
			values.array.capabilities.writeArrayElement(
				values.array.reference.target,
				values.start + offset,
				decodeJniPrimitiveValue(spec, bytes, offset * spec.bytes)
			);
		}
	}
	return finishRegion(context, spec, values, "Set");
}

function readRegionArguments(context, machineState, spec) {
	const registers = context.registers;
	validateJniPrimitiveArrayEnvironment(registers, machineState);
	const handle = registers.read(1, 64, "zero");
	const start = readJniArraySize(registers, 2, "start");
	const count = readJniArraySize(registers, 3, "count");
	const pointer = registers.read(4, 64, "zero");
	const array = requireJniPrimitiveArray(machineState, handle, spec);
	validateJniPrimitiveArrayRange(array.length, start, count);
	return Object.freeze({ array, count, handle, pointer, start });
}

function finishRegion(context, spec, values, direction) {
	resumeJniPrimitiveArray(context.registers);
	return Object.freeze({
		count: values.count,
		descriptor: spec.descriptor,
		handle: values.handle.toString(),
		operation: `${direction}${spec.stem}ArrayRegion`,
		pointer: values.pointer.toString(),
		start: values.start
	});
}
