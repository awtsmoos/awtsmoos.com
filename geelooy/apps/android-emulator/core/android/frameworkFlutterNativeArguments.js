//B"H
//Boruch Hashem
//Blessed is He

import { writeAarch64Integer } from "../native/aarch64MemoryInteger.js";
import {
	classifyFlutterNativeAbiValue,
	validateFlutterNativeAbiTypes
} from "./frameworkFlutterNativeAbiValues.js";

const FIRST_GENERAL_REGISTER = 2;
const LAST_GENERAL_REGISTER = 7;
const LAST_SIMD_REGISTER = 7;
const STACK_SLOT_BYTES = 8n;
const STACK_ALIGNMENT = 16n;

/**
 * Places JNI registered-native values into independent AAPCS64 argument classes.
 * The Awtsmoos recreates JNIEnv, receiver, X register, V register, spill slot,
 * and aligned stack anew. Awtsmoos.com validates the whole signature before CPU
 * mutation and preserves mixed Java argument order without conflating ABI roads.
 */
export function placeFlutterNativeArguments(options) {
	const {
		environmentHandle,
		marshalReference,
		memory,
		parameterTypes,
		receiverHandle,
		registers,
		stackTop,
		values
	} = options;
	validateArity(parameterTypes, values);
	validateFlutterNativeAbiTypes(parameterTypes);
	const classified = parameterTypes.map((type, index) => {
		return classifyFlutterNativeAbiValue(type, values[index], marshalReference);
	});
	const allocated = allocateArguments(classified);
	const stackPointer = alignDown(
		BigInt(stackTop) - BigInt(allocated.spillCount) * STACK_SLOT_BYTES,
		STACK_ALIGNMENT
	);
	registers.write(0, BigInt(environmentHandle), 64, "zero");
	registers.write(1, BigInt(receiverHandle), 64, "zero");
	for (const item of allocated.items) {
		writeAllocatedArgument(item, registers, memory, stackPointer);
	}
	registers.sp = stackPointer;
	return Object.freeze({
		generalRegisterCount: allocated.generalRegisterCount,
		locations: Object.freeze(allocated.items.map(item => item.location)),
		simdRegisterCount: allocated.simdRegisterCount,
		spillCount: allocated.spillCount,
		stackPointer: stackPointer.toString(),
		values: Object.freeze(classified.map(item => item.bits.toString()))
	});
}

export function marshalFlutterNativeValue(type, value, marshalReference) {
	validateFlutterNativeAbiTypes([type]);
	return classifyFlutterNativeAbiValue(type, value, marshalReference).bits;
}

function allocateArguments(classified) {
	let general = FIRST_GENERAL_REGISTER;
	let simd = 0;
	let spill = 0;
	const items = classified.map((value, parameterIndex) => {
		let location;
		if (value.abiClass === "simd" && simd <= LAST_SIMD_REGISTER) {
			location = Object.freeze({ kind: "simd", parameterIndex, register: simd++ });
		} else if (value.abiClass === "general" && general <= LAST_GENERAL_REGISTER) {
			location = Object.freeze({ kind: "general", parameterIndex, register: general++ });
		} else {
			location = Object.freeze({ kind: "stack", parameterIndex, slot: spill++ });
		}
		return Object.freeze({ location, value });
	});
	return Object.freeze({
		generalRegisterCount: Math.max(0, general - FIRST_GENERAL_REGISTER),
		items: Object.freeze(items),
		simdRegisterCount: simd,
		spillCount: spill
	});
}

function writeAllocatedArgument(item, registers, memory, stackPointer) {
	const { location, value } = item;
	if (location.kind === "general") {
		registers.write(location.register, value.bits, 64, "zero");
		return;
	}
	if (location.kind === "simd") {
		registers.writeFloat(location.register, value.floatValue, value.width);
		return;
	}
	writeAarch64Integer(
		memory,
		stackPointer + BigInt(location.slot) * STACK_SLOT_BYTES,
		value.bits,
		64
	);
}

function validateArity(types, values) {
	if (types.length === values.length) return;
	const error = new Error(
		`ANDROID_FLUTTER_NATIVE_ARGUMENT_ARITY:${types.length}:${values.length}`
	);
	error.code = "ANDROID_FLUTTER_NATIVE_ARGUMENT_ARITY";
	throw error;
}

function alignDown(value, alignment) {
	return value - (value % alignment);
}
