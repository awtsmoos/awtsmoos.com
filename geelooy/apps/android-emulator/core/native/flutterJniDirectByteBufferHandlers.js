//B"H
//Boruch Hashem
//Blessed be He

import { jniGuestThreadKey } from "./jniGuestThreadKey.js";
import {
	assertJniDirectBufferSpan,
	handleJniDirectBufferAddress,
	handleJniDirectBufferCapacity,
	readJniDirectBufferCapacity,
	resumeJniDirectBuffer,
	validateJniDirectBufferEnvironment
} from "./flutterJniDirectByteBufferSupport.js";

const JAVA_BYTE_BUFFER = "Ljava/nio/ByteBuffer;";

/**
 * Registers JNI direct-buffer construction and introspection as real memory aliases.
 *
 * NewDirectByteBuffer returns a normal local jobject whose Dalvik target is created by
 * the Android runtime while metadata preserves the native pointer. Address/capacity
 * queries reveal only buffers created over validated guest memory and never host bytes.
 *
 * @param {object} registry Native host-import registry.
 * @param {object} machineState Persistent JNI references, memory, and Android factory.
 * @returns {object} The same registry for registration composition.
 */
export function registerFlutterJniDirectByteBufferHandlers(registry, machineState) {
	registry.register("JNINativeInterface.NewDirectByteBuffer", context => {
		return newDirectByteBuffer(context, machineState);
	});
	registry.register("JNINativeInterface.GetDirectBufferAddress", context => {
		return handleJniDirectBufferAddress(context, machineState);
	});
	registry.register("JNINativeInterface.GetDirectBufferCapacity", context => {
		return handleJniDirectBufferCapacity(context, machineState);
	});
	return registry;
}

/**
 * Creates one local Java ByteBuffer that aliases a validated native guest span.
 * The returned JNI handle follows the current guest thread's local-reference lifetime.
 */
function newDirectByteBuffer(context, machineState) {
	validateJniDirectBufferEnvironment(context.registers, machineState);
	const address = context.registers.read(1, 64, "zero");
	const capacity = readJniDirectBufferCapacity(context.registers);
	assertJniDirectBufferSpan(machineState, address, capacity);
	if (typeof machineState.createDirectByteBuffer !== "function") {
		throw directBufferFactoryError();
	}
	const target = machineState.createDirectByteBuffer(
		machineState.memory,
		address,
		capacity
	);
	const handle = createDirectBufferReference(
		machineState,
		context,
		target,
		address,
		capacity
	);
	context.registers.write(0, handle, 64, "zero");
	resumeJniDirectBuffer(context.registers);
	return Object.freeze({
		address: address.toString(),
		capacity,
		handle: handle.toString(),
		operation: "NewDirectByteBuffer"
	});
}

/** Creates the thread-local JNI wrapper around one Dalvik ByteBuffer target. */
function createDirectBufferReference(
	machineState,
	context,
	target,
	address,
	capacity
) {
	return machineState.jniReferences.create(
		"object",
		`${JAVA_BYTE_BUFFER}#native-${address}-${capacity}`,
		target,
		{
			dalvikType: JAVA_BYTE_BUFFER,
			directAddress: address.toString(),
			directCapacity: capacity,
			scope: "local"
		},
		jniGuestThreadKey(context)
	);
}

function directBufferFactoryError() {
	const error = new Error("JNI_DIRECT_BUFFER_FACTORY");
	error.code = "JNI_DIRECT_BUFFER_FACTORY";
	return error;
}
