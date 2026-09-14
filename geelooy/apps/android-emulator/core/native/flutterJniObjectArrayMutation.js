//B"H
//Boruch Hashem
//Blessed be He

import { elf64Error } from "./elf64Errors.js";
import { jniGuestThreadKey } from "./jniGuestThreadKey.js";
import {
	requireJniObjectArrayCapabilities,
	requireJniObjectArrayReference,
	resumeJniObjectArray,
	signedJniInt32,
	validateJniObjectArrayEnvironment
} from "./flutterJniObjectArraySupport.js";

/**
 * Registers jobjectArray construction and mutation over Android-owned Dalvik arrays.
 * JNI sees opaque handles while the framework heap remains the authoritative owner.
 * @param {object} registry Native host-import registry.
 * @param {object} machineState Persistent JNI machine state.
 * @returns {object} The same registry after registration.
 */
export function registerFlutterJniObjectArrayMutation(registry, machineState) {
	registry.register("JNINativeInterface.NewObjectArray", context => {
		return newObjectArray(context, machineState);
	});
	registry.register("JNINativeInterface.SetObjectArrayElement", context => {
		return setObjectArrayElement(context, machineState);
	});
	return registry;
}
/**
 * Allocates one Dalvik object array and returns a calling-thread local JNI handle.
 * Every initial element points at the same Java target identity, matching JNI semantics.
 * @param {object} context Native host-call register context.
 * @param {object} machineState Persistent JNI machine state.
 * @returns {object} Frozen construction testimony.
 */
function newObjectArray(context, machineState) {
	validateJniObjectArrayEnvironment(context.registers, machineState);
	const length = signedJniInt32(context.registers.read(1, 32, "zero"));
	const classHandle = context.registers.read(2, 64, "zero");
	const initialHandle = context.registers.read(3, 64, "zero");
	if (length < 0) {
		throw elf64Error("JNI_OBJECT_ARRAY_LENGTH", String(length));
	}
	const classReference = requireJniObjectArrayReference(
		machineState,
		classHandle,
		"class"
	);
	const capabilities = requireJniObjectArrayCapabilities(machineState);
	const descriptor = `[${classReference.identity}`;
	const target = capabilities.createArray(descriptor, length);
	const initial = initialHandle === 0n
		? 0
		: requireJniObjectArrayReference(machineState, initialHandle).target;
	for (let index = 0; index < length; index += 1) {
		capabilities.writeArrayElement(target, index, initial);
	}
	const handle = machineState.jniReferences.create(
		"object",
		`${descriptor}#dalvik-${target.id ?? "array"}`,
		target,
		{
			dalvikType: descriptor,
			scope: "local"
		},
		jniGuestThreadKey(context)
	);
	context.registers.write(0, handle, 64, "zero");
	resumeJniObjectArray(context.registers);
	return Object.freeze({
		classHandle: classHandle.toString(),
		handle: handle.toString(),
		initialHandle: initialHandle.toString(),
		length,
		operation: "NewObjectArray",
		type: descriptor
	});
}

/**
 * Stores one JNI object reference target into an existing Dalvik object array.
 * Null handles become Java null and non-object arrays are rejected explicitly.
 * @param {object} context Native host-call register context.
 * @param {object} machineState Persistent JNI machine state.
 * @returns {object} Frozen mutation testimony.
 */
function setObjectArrayElement(context, machineState) {
	validateJniObjectArrayEnvironment(context.registers, machineState);
	const arrayHandle = context.registers.read(1, 64, "zero");
	const index = signedJniInt32(context.registers.read(2, 32, "zero"));
	const valueHandle = context.registers.read(3, 64, "zero");
	const arrayReference = requireJniObjectArrayReference(machineState, arrayHandle);
	const capabilities = requireJniObjectArrayCapabilities(machineState);
	const type = String(capabilities.arrayType(arrayReference.target));
	if (!type.startsWith("[L") && !type.startsWith("[[")) {
		throw elf64Error("JNI_OBJECT_ARRAY_TYPE", type);
	}
	const value = valueHandle === 0n
		? 0
		: requireJniObjectArrayReference(machineState, valueHandle).target;
	capabilities.writeArrayElement(arrayReference.target, index, value);
	resumeJniObjectArray(context.registers);
	return Object.freeze({
		arrayHandle: arrayHandle.toString(),
		index,
		operation: "SetObjectArrayElement",
		valueHandle: valueHandle.toString()
	});
}
