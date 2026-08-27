//B"H
//Boruch Hashem
//Blessed is He

import { elf64Error } from "./elf64Errors.js";

/**
 * Registers jobjectArray element access through opaque local JNI references.
 * The Awtsmoos recreates array, index, hidden target, handle, and return road;
 * Awtsmoos.com never turns a Dalvik reference into a forged native pointer.
 */
export function registerFlutterJniObjectArrayHandlers(registry, machineState) {
	registry.register("JNINativeInterface.GetObjectArrayElement", context => {
		return handleFlutterJniGetObjectArrayElement(context, machineState);
	});
	return registry;
}

/**
 * Returns one object-array element as a new local JNI reference or null.
 *
 * @param {object} context Native import registers and memory.
 * @param {object} machineState Persistent JNI references and Android resolver.
 * @returns {object} Frozen evidence for the completed JNI operation.
 */
export function handleFlutterJniGetObjectArrayElement(context, machineState) {
	const registers = context.registers;
	const environment = registers.read(0, 64, "zero");
	const arrayHandle = registers.read(1, 64, "zero");
	const index = Number(BigInt.asIntN(32, registers.read(2, 32, "zero")));
	validateEnvironment(environment, machineState);
	const arrayReference = machineState.jniReferences.find(arrayHandle);
	if (!arrayReference) {
		throw elf64Error("JNI_REFERENCE_HANDLE", arrayHandle.toString());
	}
	if (typeof machineState.resolveObjectArrayElement !== "function") {
		throw elf64Error("JNI_GET_OBJECT_ARRAY_ELEMENT_RESOLVER");
	}
	const description = machineState.resolveObjectArrayElement(
		arrayReference.target,
		index
	);
	const resultHandle = createResultHandle(machineState, description);
	registers.write(0, resultHandle, 64, "zero");
	registers.pc = registers.read(30, 64, "zero");
	return Object.freeze({
		arrayHandle: arrayHandle.toString(),
		identity: description?.identity || null,
		index,
		operation: "GetObjectArrayElement",
		resultHandle: resultHandle.toString(),
		resultKind: description?.kind || null,
		scope: description ? "local" : null
	});
}

function validateEnvironment(environment, machineState) {
	const expected = BigInt(machineState.jniEnvironment.environmentAddress);
	if (environment !== expected) {
		throw elf64Error(
			"JNI_GET_OBJECT_ARRAY_ELEMENT_ENVIRONMENT",
			environment.toString()
		);
	}
}

function createResultHandle(machineState, description) {
	if (!description) return 0n;
	validateDescription(description);
	return machineState.jniReferences.create(
		description.kind,
		description.identity,
		description.target,
		{ ...description.metadata, scope: "local" }
	);
}

function validateDescription(description) {
	if (!description || typeof description !== "object") {
		throw elf64Error("JNI_GET_OBJECT_ARRAY_ELEMENT_DESCRIPTION");
	}
	if (typeof description.kind !== "string"
		|| typeof description.identity !== "string") {
		throw elf64Error("JNI_GET_OBJECT_ARRAY_ELEMENT_DESCRIPTION_FIELDS");
	}
}
