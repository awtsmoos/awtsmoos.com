//B"H
//Boruch Hashem
//Blessed be He

import { elf64Error } from "./elf64Errors.js";
import { jniGuestThreadKey } from "./jniGuestThreadKey.js";
import {
	registerFlutterJniObjectArrayMutation
} from "./flutterJniObjectArrayMutation.js";
import {
	requireJniObjectArrayReference,
	resumeJniObjectArray,
	signedJniInt32,
	validateJniObjectArrayEnvironment
} from "./flutterJniObjectArraySupport.js";

/**
 * Registers JNI object-array construction, mutation, and element retrieval.
 * Returned jobject elements remain local to the calling emulated pthread.
 * @param {object} registry Native host-import registry.
 * @param {object} machineState Persistent JNI machine state.
 * @returns {object} The same registry after object-array registration.
 */
export function registerFlutterJniObjectArrayHandlers(registry, machineState) {
	registry.register("JNINativeInterface.GetObjectArrayElement", context => {
		return handleFlutterJniGetObjectArrayElement(context, machineState);
	});
	registerFlutterJniObjectArrayMutation(registry, machineState);
	return registry;
}

/**
 * Resolves one jobjectArray element and returns a thread-local JNI reference.
 * Null Java elements become JNI null; malformed resolver descriptions fail loudly.
 * @param {object} context Native host-call register context.
 * @param {object} machineState Persistent JNI machine state.
 * @returns {object} Frozen element-access testimony.
 */
export function handleFlutterJniGetObjectArrayElement(context, machineState) {
	const registers = context.registers;
	validateJniObjectArrayEnvironment(registers, machineState);
	const arrayHandle = registers.read(1, 64, "zero");
	const index = signedJniInt32(registers.read(2, 32, "zero"));
	const arrayReference = requireJniObjectArrayReference(machineState, arrayHandle);
	if (typeof machineState.resolveObjectArrayElement !== "function") {
		throw elf64Error("JNI_GET_OBJECT_ARRAY_ELEMENT_RESOLVER");
	}
	const description = machineState.resolveObjectArrayElement(
		arrayReference.target,
		index
	);
	const resultHandle = createResultHandle(
		machineState,
		description,
		jniGuestThreadKey(context)
	);
	registers.write(0, resultHandle, 64, "zero");
	resumeJniObjectArray(registers);
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

/**
 * Creates a local JNI handle from one Android-owned element description.
 * @param {object} machineState Persistent JNI reference store.
 * @param {object|null} description Android resolver result or Java null.
 * @param {bigint} threadKey Calling guest pthread identity.
 * @returns {bigint} JNI local handle or zero for Java null.
 */
function createResultHandle(machineState, description, threadKey) {
	if (!description) return 0n;
	validateDescription(description);
	return machineState.jniReferences.create(
		description.kind,
		description.identity,
		description.target,
		{ ...description.metadata, scope: "local" },
		threadKey
	);
}

/**
 * Validates the narrow Android-to-JNI description covenant for one object element.
 * @param {object} description Resolver-produced object identity and target record.
 * @returns {void}
 */
function validateDescription(description) {
	if (!description || typeof description !== "object") {
		throw elf64Error("JNI_GET_OBJECT_ARRAY_ELEMENT_DESCRIPTION");
	}
	if (typeof description.kind !== "string"
		|| typeof description.identity !== "string") {
		throw elf64Error("JNI_GET_OBJECT_ARRAY_ELEMENT_DESCRIPTION_FIELDS");
	}
}
