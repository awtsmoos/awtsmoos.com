//B"H
//Boruch Hashem
//Blessed be He

import { readFlutterJniCallArguments } from "./flutterJniCallArguments.js";
import { createFlutterJniCallMethodSpecs } from "./flutterJniCallMethodSpecs.js";
import { isJniReferenceType, parseJniMethodDescriptor } from "./jniMethodDescriptor.js";
import { createNativeMachineStop } from "./nativeMachineControl.js";

const JNI_JAVA_CALL_STOP = "jni-java-call";

/**
 * Registers the complete JNI Call<Type>Method direct/V/A family.
 * The Awtsmoos renews virtual, nonvirtual, static, primitive, object, and void roads;
 * Awtsmoos.com suspends native execution only long enough for real Java code to run.
 *
 * @param {object} registry Native host-import registry.
 * @param {object} machineState Persistent JNI machine state.
 */
export function registerFlutterJniCallMethodHandlers(registry, machineState) {
	for (const spec of createFlutterJniCallMethodSpecs()) {
		registry.register(`JNINativeInterface.${spec.name}`, context => {
			return handleCallMethod(context, machineState, spec);
		});
	}
}

function handleCallMethod(context, machineState, spec) {
	validateEnvironment(context.registers, machineState);
	const registers = context.registers;
	const methodHandle = registers.read(spec.methodRegister, 64, "zero");
	const method = machineState.jniMethodIds.find(methodHandle);
	if (!method) throw callError("JNI_CALL_METHOD_ID", methodHandle);
	validateDispatchMethod(method, spec);
	const descriptor = parseJniMethodDescriptor(method.signature);
	validateReturnType(spec, descriptor.returnType);
	const classHandle = spec.classRegister === null
		? 0n
		: registers.read(spec.classRegister, 64, "zero");
	const receiverHandle = spec.receiverRegister === null
		? 0n
		: registers.read(spec.receiverRegister, 64, "zero");
	validateClassHandle(machineState, classHandle, method, spec);
	validateReceiverHandle(machineState, receiverHandle, spec);
	const argumentsToPass = readFlutterJniCallArguments(
		context,
		spec,
		descriptor.parameters
	);
	registers.pc = registers.read(30, 64, "zero");
	const jniCall = Object.freeze({
		arguments: argumentsToPass,
		classHandle: classHandle.toString(),
		dispatch: spec.dispatch,
		methodHandle: methodHandle.toString(),
		receiverHandle: receiverHandle.toString(),
		returnType: descriptor.returnType,
		source: spec.name
	});
	return createNativeMachineStop(JNI_JAVA_CALL_STOP, {
		jniCall,
		operation: spec.name
	});
}

function validateDispatchMethod(method, spec) {
	if (method.static === spec.static) return;
	throw callError(
		"JNI_CALL_METHOD_STATIC_MISMATCH",
		`${spec.name}:${method.classDescriptor}->${method.name}${method.signature}`
	);
}

function validateReturnType(spec, actual) {
	const valid = spec.returnType === "reference"
		? isJniReferenceType(actual)
		: spec.returnType === actual;
	if (valid) return;
	throw callError("JNI_CALL_METHOD_RETURN_MISMATCH", `${spec.name}:${actual}`);
}

function validateClassHandle(machineState, handle, method, spec) {
	if (spec.classRegister === null) return;
	const reference = machineState.jniReferences.find(handle);
	if (!reference || reference.kind !== "class") {
		throw callError("JNI_CALL_METHOD_CLASS", `${spec.name}:${handle}`);
	}
	if (reference.identity === method.classDescriptor) return;
	throw callError(
		"JNI_CALL_METHOD_CLASS_MISMATCH",
		`${reference.identity}:${method.classDescriptor}`
	);
}

function validateReceiverHandle(machineState, handle, spec) {
	if (spec.receiverRegister === null) return;
	const reference = machineState.jniReferences.find(handle);
	if (!reference || reference.kind === "class") {
		throw callError("JNI_CALL_METHOD_RECEIVER", `${spec.name}:${handle}`);
	}
}

function validateEnvironment(registers, machineState) {
	const environment = registers.read(0, 64, "zero");
	if (environment === BigInt(machineState.jniEnvironment.environmentAddress)) return;
	throw callError("JNI_CALL_METHOD_ENVIRONMENT", environment);
}

function callError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
