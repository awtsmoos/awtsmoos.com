//B"H
//Boruch Hashem
//Blessed be He

/** Validates one JNIEnv pointer for the primitive-array family. */
export function validateJniPrimitiveArrayEnvironment(registers, machineState) {
	const actual = registers.read(0, 64, "zero");
	const expected = BigInt(machineState.jniEnvironment.environmentAddress);
	if (actual !== expected) {
		throw jniPrimitiveArrayError("JNI_PRIMITIVE_ARRAY_ENVIRONMENT", actual);
	}
}

/** Returns the Android-owned generic array capability facade. */
export function requireJniArrayCapabilities(machineState) {
	const capabilities = machineState.jniArrayCapabilities;
	if (!capabilities
		|| typeof capabilities.arrayType !== "function"
		|| typeof capabilities.createArray !== "function"
		|| typeof capabilities.readArrayElement !== "function"
		|| typeof capabilities.writeArrayElement !== "function") {
		throw jniPrimitiveArrayError("JNI_PRIMITIVE_ARRAY_CAPABILITIES");
	}
	return capabilities;
}

/** Resolves and type-checks one primitive jobject array handle. */
export function requireJniPrimitiveArray(machineState, handle, spec = null) {
	const reference = machineState.jniReferences.find(handle);
	if (!reference) {
		throw jniPrimitiveArrayError("JNI_PRIMITIVE_ARRAY_HANDLE", handle);
	}
	const capabilities = requireJniArrayCapabilities(machineState);
	const descriptor = String(capabilities.arrayType(reference.target));
	if (spec && descriptor !== spec.descriptor) {
		throw jniPrimitiveArrayError(
			"JNI_PRIMITIVE_ARRAY_TYPE",
			`${descriptor}:${spec.descriptor}`
		);
	}
	const length = Number(machineState.resolveArrayLength?.(reference.target));
	if (!Number.isInteger(length) || length < 0) {
		throw jniPrimitiveArrayError("JNI_PRIMITIVE_ARRAY_LENGTH", length);
	}
	return Object.freeze({ capabilities, descriptor, length, reference });
}

/** Reads one signed JNI jsize argument from the requested AArch64 register. */
export function readJniArraySize(registers, index, label) {
	const value = Number(BigInt.asIntN(32, registers.read(index, 32, "zero")));
	if (!Number.isInteger(value) || value < 0) {
		throw jniPrimitiveArrayError("JNI_PRIMITIVE_ARRAY_SIZE", `${label}:${value}`);
	}
	return value;
}

/** Validates one start/count pair against an already resolved Java array length. */
export function validateJniPrimitiveArrayRange(length, start, count) {
	if (start < 0 || count < 0 || start > length || count > length - start) {
		throw jniPrimitiveArrayError(
			"JNI_PRIMITIVE_ARRAY_RANGE",
			`${start}:${count}:${length}`
		);
	}
}

/** Writes JNI_TRUE to a non-null isCopy pointer after validating guest memory. */
export function writeJniPrimitiveIsCopy(machineState, pointer) {
	const address = BigInt(pointer);
	if (address === 0n) return;
	if (!machineState.memory.contains(address, 1)) {
		throw jniPrimitiveArrayError("JNI_PRIMITIVE_ARRAY_IS_COPY", address);
	}
	machineState.memory.write(address, Uint8Array.of(1));
}

/** Validates a guest memory span while allowing zero-byte operations. */
export function validateJniPrimitiveMemory(machineState, pointer, byteLength) {
	if (byteLength === 0) return;
	if (!machineState.memory.contains(pointer, byteLength)) {
		throw jniPrimitiveArrayError(
			"JNI_PRIMITIVE_ARRAY_MEMORY",
			`${pointer}:${byteLength}`
		);
	}
}

/** Returns from one JNI primitive-array handler through the guest link register. */
export function resumeJniPrimitiveArray(registers) {
	registers.pc = registers.read(30, 64, "zero");
}

export function jniPrimitiveArrayError(code, detail = "") {
	const suffix = detail === "" ? "" : `:${detail}`;
	const error = new Error(`${code}${suffix}`);
	error.code = code;
	return error;
}
