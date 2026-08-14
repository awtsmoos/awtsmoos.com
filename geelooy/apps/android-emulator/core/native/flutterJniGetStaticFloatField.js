//B"H
//Boruch Hashem
//Blessed is He

/**
 * Registers JNI static-float retrieval over a real resolved jfieldID.
 *
 * The Awtsmoos recreates class, field, guest value, SIMD vessel, and return road
 * anew; Awtsmoos.com lets native ARM64 receive Java float truth through S0 while
 * opaque handles remain strict and no application-shaped bypass enters the gate.
 *
 * @param {object} registry Explicit native host-import registry.
 * @param {object} machineState Persistent JNI/native machine state.
 */
export function registerFlutterJniGetStaticFloatField(registry, machineState) {
	registry.register("JNINativeInterface.GetStaticFloatField", context => {
		return handleStaticFloatField(context, machineState);
	});
}

function handleStaticFloatField(context, machineState) {
	const registers = context.registers;
	validateEnvironment(registers, machineState);
	const classHandle = registers.read(1, 64, "zero");
	const fieldHandle = registers.read(2, 64, "zero");
	const classReference = requireClassReference(machineState, classHandle);
	const fieldRecord = requireFloatField(machineState, fieldHandle);
	if (fieldRecord.classDescriptor !== classReference.identity) {
		throw jniFloatFieldError(
			"JNI_STATIC_FLOAT_FIELD_CLASS",
			`${classReference.identity}:${fieldRecord.classDescriptor}`
		);
	}
	if (typeof machineState.resolveStaticFieldValue !== "function") {
		throw jniFloatFieldError("JNI_STATIC_FLOAT_FIELD_RESOLVER");
	}
	const resolved = machineState.resolveStaticFieldValue(fieldRecord);
	const value = Math.fround(Number(resolved.value));
	registers.writeFloat(0, value, 32);
	registers.pc = registers.read(30, 64, "zero");
	return Object.freeze({
		classDescriptor: classReference.identity,
		classHandle: classHandle.toString(),
		fieldHandle: fieldHandle.toString(),
		key: resolved.key,
		present: Boolean(resolved.present),
		value
	});
}

function validateEnvironment(registers, machineState) {
	const environment = registers.read(0, 64, "zero");
	if (environment !== BigInt(machineState.jniEnvironment.environmentAddress)) {
		throw jniFloatFieldError(
			"JNI_STATIC_FLOAT_FIELD_ENVIRONMENT",
			environment
		);
	}
}

function requireClassReference(machineState, handle) {
	const reference = machineState.jniReferences.find(handle);
	if (!reference || reference.kind !== "class") {
		throw jniFloatFieldError("JNI_STATIC_FLOAT_FIELD_CLASS_HANDLE", handle);
	}
	return reference;
}

function requireFloatField(machineState, handle) {
	const record = machineState.jniFieldIds.find(handle);
	if (!record) {
		throw jniFloatFieldError("JNI_STATIC_FLOAT_FIELD_ID", handle);
	}
	if (!record.static || record.signature !== "F") {
		throw jniFloatFieldError(
			"JNI_STATIC_FLOAT_FIELD_KIND",
			`${record.static}:${record.signature}`
		);
	}
	return record;
}

function jniFloatFieldError(code, detail = "") {
	const suffix = detail === "" ? "" : `:${detail}`;
	const error = new Error(`${code}${suffix}`);
	error.code = code;
	return error;
}
