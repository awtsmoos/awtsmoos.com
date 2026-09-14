//B"H
//Boruch Hashem
//Blessed be He

const INVALID_CAPACITY = BigInt.asUintN(64, -1n);

/**
 * Validates the JNIEnv pointer supplied to one direct-buffer JNI operation.
 * @param {object} registers Active guest AArch64 registers.
 * @param {object} machineState Persistent Flutter JNI machine state.
 * @returns {void}
 */
export function validateJniDirectBufferEnvironment(registers, machineState) {
	const actual = registers.read(0, 64, "zero");
	const expected = BigInt(machineState.jniEnvironment.environmentAddress);
	if (actual !== expected) {
		throw jniDirectBufferError("JNI_DIRECT_BUFFER_ENVIRONMENT", actual);
	}
}

/**
 * Reads and validates JNI's signed jlong capacity as a safe JavaScript integer.
 * @param {object} registers Active guest register file.
 * @returns {number} Non-negative direct-buffer capacity.
 */
export function readJniDirectBufferCapacity(registers) {
	const value = BigInt.asIntN(64, registers.read(2, 64, "zero"));
	if (value < 0n || value > BigInt(Number.MAX_SAFE_INTEGER)) {
		throw jniDirectBufferError("JNI_DIRECT_BUFFER_CAPACITY", value);
	}
	return Number(value);
}

/**
 * Ensures every byte of a direct buffer belongs to mapped guest-native memory.
 * Zero-capacity buffers intentionally require no dereferenceable byte span.
 */
export function assertJniDirectBufferSpan(machineState, address, capacity) {
	if (capacity > 0 && !machineState.memory.contains(address, capacity)) {
		throw jniDirectBufferError(
			"JNI_DIRECT_BUFFER_RANGE",
			`${address}:${capacity}`
		);
	}
}

/** Returns the direct JNI reference metadata, or null for null/non-direct objects. */
export function findJniDirectBufferReference(machineState, handle) {
	if (handle === 0n) return null;
	const reference = machineState.jniReferences.find(handle);
	if (reference?.metadata?.directAddress === undefined) return null;
	return reference;
}

/** Completes GetDirectBufferAddress using the original guest-native address. */
export function handleJniDirectBufferAddress(context, machineState) {
	validateJniDirectBufferEnvironment(context.registers, machineState);
	const handle = context.registers.read(1, 64, "zero");
	const reference = findJniDirectBufferReference(machineState, handle);
	const address = reference ? BigInt(reference.metadata.directAddress) : 0n;
	context.registers.write(0, address, 64, "zero");
	resumeJniDirectBuffer(context.registers);
	return Object.freeze({
		address: address.toString(),
		handle: handle.toString(),
		operation: "GetDirectBufferAddress"
	});
}

/** Completes GetDirectBufferCapacity with JNI's -1 sentinel for non-direct objects. */
export function handleJniDirectBufferCapacity(context, machineState) {
	validateJniDirectBufferEnvironment(context.registers, machineState);
	const handle = context.registers.read(1, 64, "zero");
	const reference = findJniDirectBufferReference(machineState, handle);
	const value = reference
		? BigInt(reference.metadata.directCapacity)
		: INVALID_CAPACITY;
	context.registers.write(0, value, 64, "zero");
	resumeJniDirectBuffer(context.registers);
	return Object.freeze({
		capacity: BigInt.asIntN(64, value).toString(),
		handle: handle.toString(),
		operation: "GetDirectBufferCapacity"
	});
}

/** Returns from one host JNI handler through the guest link register. */
export function resumeJniDirectBuffer(registers) {
	registers.pc = registers.read(30, 64, "zero");
}

function jniDirectBufferError(code, detail = "") {
	const error = new Error(detail === "" ? code : `${code}:${detail}`);
	error.code = code;
	return error;
}
