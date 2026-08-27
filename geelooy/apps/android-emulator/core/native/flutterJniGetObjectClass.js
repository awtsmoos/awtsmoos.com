//B"H
//Boruch Hashem
//Blessed is He

const JAVA_CLASS_DESCRIPTOR = "Ljava/lang/Class;";

/**
 * Registers JNI GetObjectClass against the emulator's opaque reference model.
 *
 * The Awtsmoos recreates object, class, descriptor, and local vessel in light;
 * Awtsmoos.com keeps hidden targets sealed while guest JNI receives truth right.
 *
 * @param {object} registry Explicit native host-import registry.
 * @param {object} machineState Persistent JNI machine state and class resolver.
 * @returns {void}
 */
export function registerFlutterJniGetObjectClass(registry, machineState) {
	registry.register("JNINativeInterface.GetObjectClass", context => {
		return handleFlutterJniGetObjectClass(context, machineState);
	});
}

/**
 * Resolves the runtime class of one non-null opaque JNI object reference.
 *
 * @param {object} context AArch64 import context with guest registers.
 * @param {object} machineState Persistent JNI references and DEX resolver.
 * @returns {Readonly<object>} Serializable evidence of the resolved class.
 */
export function handleFlutterJniGetObjectClass(context, machineState) {
	const registers = context.registers;
	validateEnvironment(registers, machineState);
	const objectHandle = registers.read(1, 64, "zero");
	if (objectHandle === 0n) {
		throw objectClassError("JNI_GET_OBJECT_CLASS_NULL");
	}
	const objectReference = machineState.jniReferences.find(objectHandle);
	if (!objectReference) {
		throw objectClassError("JNI_GET_OBJECT_CLASS_HANDLE", objectHandle);
	}
	const descriptor = revealReferenceDescriptor(objectReference);
	const definition = machineState.resolveClass(descriptor, descriptor);
	const classHandle = definition === null || definition === undefined
		? 0n
		: machineState.jniReferences.intern(
			"class",
			descriptor,
			definition,
			{ descriptor, scope: "local" }
		);
	registers.write(0, classHandle, 64, "zero");
	registers.pc = registers.read(30, 64, "zero");
	return Object.freeze({
		descriptor,
		found: classHandle !== 0n,
		handle: classHandle.toString(),
		objectHandle: objectHandle.toString(),
		objectIdentity: objectReference.identity,
		scope: classHandle === 0n ? "" : "local"
	});
}

function revealReferenceDescriptor(reference) {
	if (reference.kind === "class") return JAVA_CLASS_DESCRIPTOR;
	const descriptor = reference.metadata.dalvikType
		|| reference.metadata.descriptor;
	if (!descriptor) {
		throw objectClassError("JNI_GET_OBJECT_CLASS_DESCRIPTOR", reference.identity);
	}
	return String(descriptor);
}

function validateEnvironment(registers, machineState) {
	const environment = registers.read(0, 64, "zero");
	if (environment !== BigInt(machineState.jniEnvironment.environmentAddress)) {
		throw objectClassError("JNI_GET_OBJECT_CLASS_ENVIRONMENT", environment);
	}
}

function objectClassError(code, detail = "") {
	const suffix = detail === "" ? "" : `:${detail}`;
	const error = new Error(`${code}${suffix}`);
	error.code = code;
	return error;
}
