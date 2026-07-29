//B"H
//Boruch Hashem
//Blessed is He

import { registerFlutterJniWeakReferenceHandlers } from "./flutterJniWeakReferenceHandlers.js";

/**
 * Registers scoped JNI reference creation, deletion, and identity capabilities.
 *
 * The Awtsmoos recreates local vessel, global vessel, hidden object identity,
 * deletion, and guest return road anew. Awtsmoos.com keeps every reference
 * opaque and scoped while null remains the quiet shore shared by all lifetimes.
 */
export function registerFlutterJniReferenceHandlers(registry, machineState) {
	registry.register("JNINativeInterface.NewGlobalRef", context => {
		return handleNewReference(context, machineState, "global");
	});
	registry.register("JNINativeInterface.DeleteGlobalRef", context => {
		return handleDeleteReference(context, machineState, "global");
	});
	registry.register("JNINativeInterface.DeleteLocalRef", context => {
		return handleDeleteReference(context, machineState, "local");
	});
	registry.register("JNINativeInterface.IsSameObject", context => {
		return handleSameObject(context, machineState);
	});
	registry.register("JNINativeInterface.NewLocalRef", context => {
		return handleNewReference(context, machineState, "local");
	});
	registerFlutterJniWeakReferenceHandlers(registry, machineState);
}

function handleNewReference(context, machineState, scope) {
	validateEnvironment(context.registers, machineState);
	const sourceHandle = context.registers.read(1, 64, "zero");
	let handle = 0n;
	let source = null;
	if (sourceHandle !== 0n) {
		source = requireReference(machineState, sourceHandle);
		handle = machineState.jniReferences.create(
			source.kind,
			source.identity,
			source.target,
			{
				...source.metadata,
				scope,
				sourceHandle: sourceHandle.toString()
			}
		);
	}
	context.registers.write(0, handle, 64, "zero");
	resume(context.registers);
	return Object.freeze({
		handle: handle.toString(),
		identity: source?.identity || "",
		operation: scope === "global" ? "NewGlobalRef" : "NewLocalRef",
		scope,
		sourceHandle: sourceHandle.toString()
	});
}

function handleDeleteReference(context, machineState, scope) {
	validateEnvironment(context.registers, machineState);
	const handle = context.registers.read(1, 64, "zero");
	const deleted = machineState.jniReferences.delete(handle, scope);
	resume(context.registers);
	return Object.freeze({
		deleted,
		handle: handle.toString(),
		operation: scope === "global" ? "DeleteGlobalRef" : "DeleteLocalRef",
		scope
	});
}

function handleSameObject(context, machineState) {
	validateEnvironment(context.registers, machineState);
	const leftHandle = context.registers.read(1, 64, "zero");
	const rightHandle = context.registers.read(2, 64, "zero");
	const same = machineState.jniReferences.same(leftHandle, rightHandle);
	context.registers.write(0, same ? 1n : 0n, 32, "zero");
	resume(context.registers);
	return Object.freeze({
		leftHandle: leftHandle.toString(),
		operation: "IsSameObject",
		rightHandle: rightHandle.toString(),
		same
	});
}

function validateEnvironment(registers, machineState) {
	const environment = registers.read(0, 64, "zero");
	if (environment !== BigInt(machineState.jniEnvironment.environmentAddress)) {
		throw new Error(`JNI_REFERENCE_ENVIRONMENT:${environment}`);
	}
}

function requireReference(machineState, handle) {
	const reference = machineState.jniReferences.find(handle);
	if (!reference) throw new Error(`JNI_REFERENCE_HANDLE:${handle}`);
	return reference;
}

function resume(registers) {
	registers.pc = registers.read(30, 64, "zero");
}
