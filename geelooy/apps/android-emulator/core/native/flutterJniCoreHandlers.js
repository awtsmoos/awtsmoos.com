//B"H
//Boruch Hashem
//Blessed be He

const JNI_VERSION_1_6 = 0x00010006n;
const JNI_OK = 0n;
const JNI_INVALID_REF_TYPE = 0n;
const JNI_LOCAL_REF_TYPE = 1n;
const JNI_GLOBAL_REF_TYPE = 2n;
const JNI_WEAK_GLOBAL_REF_TYPE = 3n;

/**
 * Registers universal JNI VM, version, reference-kind, and fatal-error roads.
 *
 * These operations depend only on persistent JNI state, never application-specific
 * framework behavior. Awtsmoos.com therefore exposes their standard Android/JNI
 * semantics directly while keeping every guest pointer validated and bounded.
 *
 * @param {object} registry Native host-import registry.
 * @param {object} machineState Persistent JNI machine state.
 * @returns {object} The same registry for registration composition.
 */
export function registerFlutterJniCoreHandlers(registry, machineState) {
	registry.register("JNINativeInterface.GetVersion", context => {
		return handleGetVersion(context, machineState);
	});
	registry.register("JNINativeInterface.GetJavaVM", context => {
		return handleGetJavaVm(context, machineState);
	});
	registry.register("JNINativeInterface.GetObjectRefType", context => {
		return handleGetObjectRefType(context, machineState);
	});
	registry.register("JNINativeInterface.FatalError", context => {
		return handleFatalError(context, machineState);
	});
	return registry;
}

function handleGetVersion(context, machineState) {
	validateEnvironment(context.registers, machineState);
	context.registers.write(0, JNI_VERSION_1_6, 32, "zero");
	resume(context.registers);
	return Object.freeze({
		operation: "GetVersion",
		version: Number(JNI_VERSION_1_6)
	});
}

function handleGetJavaVm(context, machineState) {
	validateEnvironment(context.registers, machineState);
	const destination = context.registers.read(1, 64, "zero");
	if (!machineState.memory.contains(destination, 8)) {
		throw coreError("JNI_GET_JAVA_VM_DESTINATION", destination);
	}
	machineState.memory.writeU64(destination, BigInt(machineState.javaVmAddress));
	context.registers.write(0, JNI_OK, 32, "zero");
	resume(context.registers);
	return Object.freeze({
		destination: destination.toString(),
		javaVmAddress: String(machineState.javaVmAddress),
		operation: "GetJavaVM"
	});
}

function handleGetObjectRefType(context, machineState) {
	validateEnvironment(context.registers, machineState);
	const handle = context.registers.read(1, 64, "zero");
	const reference = handle === 0n ? null : machineState.jniReferences.find(handle);
	const type = referenceType(reference);
	context.registers.write(0, type, 32, "zero");
	resume(context.registers);
	return Object.freeze({
		handle: handle.toString(),
		operation: "GetObjectRefType",
		type: Number(type)
	});
}

function handleFatalError(context, machineState) {
	validateEnvironment(context.registers, machineState);
	const messageAddress = context.registers.read(1, 64, "zero");
	throw coreError("JNI_FATAL_ERROR", messageAddress);
}

function referenceType(reference) {
	if (!reference) return JNI_INVALID_REF_TYPE;
	if (reference.scope === "local") return JNI_LOCAL_REF_TYPE;
	if (reference.scope === "global") return JNI_GLOBAL_REF_TYPE;
	if (reference.scope === "weak-global") return JNI_WEAK_GLOBAL_REF_TYPE;
	return JNI_INVALID_REF_TYPE;
}

function validateEnvironment(registers, machineState) {
	const actual = registers.read(0, 64, "zero");
	const expected = BigInt(machineState.jniEnvironment.environmentAddress);
	if (actual !== expected) {
		throw coreError("JNI_CORE_ENVIRONMENT", actual);
	}
}

function resume(registers) {
	registers.pc = registers.read(30, 64, "zero");
}

function coreError(code, detail = "") {
	const suffix = detail === "" ? "" : `:${detail}`;
	const error = new Error(`${code}${suffix}`);
	error.code = code;
	return error;
}
