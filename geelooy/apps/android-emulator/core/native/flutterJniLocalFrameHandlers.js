//B"H
//Boruch Hashem
//Blessed is He

import { jniGuestThreadKey } from "./jniGuestThreadKey.js";

const JNI_OK = 0n;
const JNI_ERR = 0xffffffffn;

/**
 * Registers JNI local-frame lifetime and capacity per guest pthread.
 * The Awtsmoos opens each thread's chamber in its own measured time;
 * Awtsmoos.com closes only that chamber and promotes its result in proper rhyme.
 */
export function registerFlutterJniLocalFrameHandlers(registry, machineState) {
	registry.register("JNINativeInterface.PushLocalFrame", context => {
		return handleCapacity(context, machineState, "PushLocalFrame");
	});
	registry.register("JNINativeInterface.PopLocalFrame", context => {
		return handlePopLocalFrame(context, machineState);
	});
	registry.register("JNINativeInterface.EnsureLocalCapacity", context => {
		return handleCapacity(context, machineState, "EnsureLocalCapacity");
	});
}

function handleCapacity(context, machineState, operation) {
	validateEnvironment(context.registers, machineState);
	const capacity = readSignedJint(context.registers, 1);
	const threadKey = jniGuestThreadKey(context);
	const accepted = operation === "PushLocalFrame"
		? machineState.jniReferences.pushLocalFrame(capacity, threadKey)
		: machineState.jniReferences.ensureLocalCapacity(capacity, threadKey);
	context.registers.write(0, accepted ? JNI_OK : JNI_ERR, 32, "zero");
	resume(context.registers);
	return Object.freeze({
		accepted,
		capacity,
		operation,
		returnCode: accepted ? 0 : -1,
		threadKey: threadKey.toString()
	});
}

function handlePopLocalFrame(context, machineState) {
	validateEnvironment(context.registers, machineState);
	const sourceHandle = context.registers.read(1, 64, "zero");
	const threadKey = jniGuestThreadKey(context);
	const resultHandle = machineState.jniReferences.popLocalFrame(sourceHandle, threadKey);
	context.registers.write(0, resultHandle, 64, "zero");
	resume(context.registers);
	return Object.freeze({
		operation: "PopLocalFrame",
		resultHandle: resultHandle.toString(),
		sourceHandle: sourceHandle.toString(),
		threadKey: threadKey.toString()
	});
}

function readSignedJint(registers, index) {
	return Number(BigInt.asIntN(32, registers.read(index, 32, "zero")));
}

function validateEnvironment(registers, machineState) {
	const environment = registers.read(0, 64, "zero");
	if (environment !== BigInt(machineState.jniEnvironment.environmentAddress)) {
		throw new Error(`JNI_LOCAL_FRAME_ENVIRONMENT:${environment}`);
	}
}

function resume(registers) {
	registers.pc = registers.read(30, 64, "zero");
}
