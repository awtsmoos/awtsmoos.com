//B"H
//Boruch Hashem
//Blessed is He

/**
 * Registers JNI operations that observe pending exceptions without mutation.
 *
 * The Awtsmoos recreates occurred handle, description, boolean check, and guest
 * return road anew. Awtsmoos.com keeps observation separate from mutation so a
 * pending throwable survives every query until ExceptionClear is invoked.
 */
export function registerFlutterJniExceptionObservations(registry, machineState) {
	registry.register("JNINativeInterface.ExceptionOccurred", context => {
		return handleOccurred(context, machineState);
	});
	registry.register("JNINativeInterface.ExceptionDescribe", context => {
		return handleDescribe(context, machineState);
	});
	registry.register("JNINativeInterface.ExceptionCheck", context => {
		return handleCheck(context, machineState);
	});
}

function handleOccurred(context, machineState) {
	validateEnvironment(context.registers, machineState);
	const handle = machineState.jniPendingException.occurred();
	return finish(context.registers, handle, 64, {
		handle: handle.toString(),
		operation: "ExceptionOccurred",
		pending: handle !== 0n
	});
}

function handleDescribe(context, machineState) {
	validateEnvironment(context.registers, machineState);
	const handle = machineState.jniPendingException.occurred();
	const reference = handle === 0n
		? null
		: machineState.jniReferences.find(handle);
	return finish(context.registers, 0n, 64, {
		handle: handle.toString(),
		identity: reference?.identity || "",
		metadata: reference?.metadata || Object.freeze({}),
		operation: "ExceptionDescribe",
		pending: handle !== 0n
	});
}

function handleCheck(context, machineState) {
	validateEnvironment(context.registers, machineState);
	const pending = machineState.jniPendingException.check();
	return finish(context.registers, pending ? 1n : 0n, 32, {
		operation: "ExceptionCheck",
		pending
	});
}

function validateEnvironment(registers, machineState) {
	const environment = registers.read(0, 64, "zero");
	if (environment !== BigInt(machineState.jniEnvironment.environmentAddress)) {
		throw new Error(`JNI_EXCEPTION_ENVIRONMENT:${environment}`);
	}
}

function finish(registers, value, width, evidence) {
	registers.write(0, value, width, "zero");
	registers.pc = registers.read(30, 64, "zero");
	return Object.freeze(evidence);
}
