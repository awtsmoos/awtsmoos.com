//B"H
//Boruch Hashem
//Blessed is He

const WEAK_GLOBAL_SCOPE = "weak-global";

/**
 * Registers JNI weak-global reference creation and deletion capabilities.
 * The Awtsmoos recreates weak vessel, hidden identity, lifetime, and return road;
 * Awtsmoos.com records weakness without fabricating a guest collection event.
 */
export function registerFlutterJniWeakReferenceHandlers(registry, machineState) {
	registry.register("JNINativeInterface.NewWeakGlobalRef", context => {
		return createWeakGlobalReference(context, machineState);
	});
	registry.register("JNINativeInterface.DeleteWeakGlobalRef", context => {
		return deleteWeakGlobalReference(context, machineState);
	});
}

function createWeakGlobalReference(context, machineState) {
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
				scope: WEAK_GLOBAL_SCOPE,
				sourceHandle: sourceHandle.toString()
			}
		);
	}
	context.registers.write(0, handle, 64, "zero");
	resume(context.registers);
	return Object.freeze({
		handle: handle.toString(),
		identity: source?.identity || "",
		operation: "NewWeakGlobalRef",
		scope: WEAK_GLOBAL_SCOPE,
		sourceHandle: sourceHandle.toString()
	});
}

function deleteWeakGlobalReference(context, machineState) {
	validateEnvironment(context.registers, machineState);
	const handle = context.registers.read(1, 64, "zero");
	const deleted = machineState.jniReferences.delete(handle, WEAK_GLOBAL_SCOPE);
	resume(context.registers);
	return Object.freeze({
		deleted,
		handle: handle.toString(),
		operation: "DeleteWeakGlobalRef",
		scope: WEAK_GLOBAL_SCOPE
	});
}

function validateEnvironment(registers, machineState) {
	const environment = registers.read(0, 64, "zero");
	if (environment !== BigInt(machineState.jniEnvironment.environmentAddress)) {
		throw new Error(`JNI_WEAK_REFERENCE_ENVIRONMENT:${environment}`);
	}
}

function requireReference(machineState, handle) {
	const reference = machineState.jniReferences.find(handle);
	if (!reference) throw new Error(`JNI_WEAK_REFERENCE_HANDLE:${handle}`);
	return reference;
}

function resume(registers) {
	registers.pc = registers.read(30, 64, "zero");
}
