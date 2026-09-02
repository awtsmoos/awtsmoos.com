//B"H
//Boruch Hashem
//Blessed is He

import { jniGuestThreadKey } from "./jniGuestThreadKey.js";
import { readNativeCString } from "./nativeCString.js";

/**
 * Registers JNI operations that create, replace, or clear pending exceptions.
 * The Awtsmoos recreates throwable, message, pending identity, and pthread shore;
 * Awtsmoos.com keeps each new local exception inside the thread that asked for more.
 */
export function registerFlutterJniExceptionMutations(registry, machineState) {
	registry.register("JNINativeInterface.Throw", context => handleThrow(context, machineState));
	registry.register("JNINativeInterface.ThrowNew", context => handleThrowNew(context, machineState));
	registry.register("JNINativeInterface.ExceptionClear", context => handleClear(context, machineState));
}

function handleThrow(context, machineState) {
	validateEnvironment(context.registers, machineState);
	const handle = context.registers.read(1, 64, "zero");
	const reference = requireReference(machineState, handle, "JNI_THROW_HANDLE");
	if (!["object", "throwable"].includes(reference.kind)) {
		throw new Error(`JNI_THROW_HANDLE:${handle}:${reference.kind}`);
	}
	machineState.jniPendingException.set(handle);
	return finish(context.registers, 0n, {
		handle: handle.toString(),
		identity: reference.identity,
		operation: "Throw"
	});
}

function handleThrowNew(context, machineState) {
	validateEnvironment(context.registers, machineState);
	const classHandle = context.registers.read(1, 64, "zero");
	const classReference = requireReference(machineState, classHandle, "JNI_THROW_NEW_CLASS");
	if (classReference.kind !== "class") {
		throw new Error(`JNI_THROW_NEW_CLASS:${classHandle}`);
	}
	const message = readNativeCString(
		context.memory,
		context.registers.read(2, 64, "zero")
	).text;
	const identity = machineState.jniPendingException.nextIdentity(classReference.identity);
	const target = Object.freeze({ classDescriptor: classReference.identity, message });
	const handle = machineState.jniReferences.create(
		"throwable",
		identity,
		target,
		{
			classDescriptor: classReference.identity,
			message,
			scope: "local"
		},
		jniGuestThreadKey(context)
	);
	machineState.jniPendingException.set(handle);
	return finish(context.registers, 0n, {
		classDescriptor: classReference.identity,
		handle: handle.toString(),
		message,
		operation: "ThrowNew"
	});
}

function handleClear(context, machineState) {
	const prior = machineState.jniPendingException.clear();
	return finish(context.registers, 0n, {
		clearedHandle: prior.toString(),
		operation: "ExceptionClear"
	});
}

function validateEnvironment(registers, machineState) {
	const environment = registers.read(0, 64, "zero");
	if (environment !== BigInt(machineState.jniEnvironment.environmentAddress)) {
		throw new Error(`JNI_EXCEPTION_ENVIRONMENT:${environment}`);
	}
}

function requireReference(machineState, handle, code) {
	const reference = machineState.jniReferences.find(handle);
	if (!reference) throw new Error(`${code}:${handle}`);
	return reference;
}

function finish(registers, value, evidence) {
	registers.write(0, value, 64, "zero");
	registers.pc = registers.read(30, 64, "zero");
	return Object.freeze(evidence);
}
