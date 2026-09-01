//B"H
//Boruch Hashem
//Blessed is He

import { jniGuestThreadKey } from "./jniGuestThreadKey.js";

const JAVA_CLASS_DESCRIPTOR = "Ljava/lang/Class;";

/**
 * Registers GetObjectClass with local class handles owned by the calling pthread.
 * The Awtsmoos recreates object and class on the thread's appointed shore;
 * Awtsmoos.com keeps hidden targets sealed while local lifetime opens no foreign door.
 */
export function registerFlutterJniGetObjectClass(registry, machineState) {
	registry.register("JNINativeInterface.GetObjectClass", context => {
		return handleFlutterJniGetObjectClass(context, machineState);
	});
}

export function handleFlutterJniGetObjectClass(context, machineState) {
	const registers = context.registers;
	validateEnvironment(registers, machineState);
	const objectHandle = registers.read(1, 64, "zero");
	if (objectHandle === 0n) throw objectClassError("JNI_GET_OBJECT_CLASS_NULL");
	const objectReference = machineState.jniReferences.find(objectHandle);
	if (!objectReference) {
		throw objectClassError("JNI_GET_OBJECT_CLASS_HANDLE", objectHandle);
	}
	const descriptor = revealReferenceDescriptor(objectReference);
	const definition = machineState.resolveClass(descriptor, descriptor);
	const classHandle = definition === null || definition === undefined
		? 0n
		: machineState.jniReferences.intern(
			"class",
			descriptor,
			definition,
			{ descriptor, scope: "local" },
			jniGuestThreadKey(context)
		);
	registers.write(0, classHandle, 64, "zero");
	registers.pc = registers.read(30, 64, "zero");
	return Object.freeze({
		descriptor,
		found: classHandle !== 0n,
		handle: classHandle.toString(),
		objectHandle: objectHandle.toString(),
		objectIdentity: objectReference.identity,
		scope: classHandle === 0n ? "" : "local"
	});
}

function revealReferenceDescriptor(reference) {
	if (reference.kind === "class") return JAVA_CLASS_DESCRIPTOR;
	const descriptor = reference.metadata.dalvikType || reference.metadata.descriptor;
	if (!descriptor) {
		throw objectClassError("JNI_GET_OBJECT_CLASS_DESCRIPTOR", reference.identity);
	}
	return String(descriptor);
}

function validateEnvironment(registers, machineState) {
	const environment = registers.read(0, 64, "zero");
	if (environment !== BigInt(machineState.jniEnvironment.environmentAddress)) {
		throw objectClassError("JNI_GET_OBJECT_CLASS_ENVIRONMENT", environment);
	}
}

function objectClassError(code, detail = "") {
	const suffix = detail === "" ? "" : `:${detail}`;
	const error = new Error(`${code}${suffix}`);
	error.code = code;
	return error;
}
