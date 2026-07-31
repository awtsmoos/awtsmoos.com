//B"H
//Boruch Hashem
//Blessed is He

import { writeAarch64Integer } from "./aarch64MemoryInteger.js";
import {
	failNativeDescriptor,
	finishNativeDescriptor,
	NATIVE_DESCRIPTOR_EAGAIN,
	NATIVE_DESCRIPTOR_EBADF,
	NATIVE_DESCRIPTOR_EFAULT,
	NATIVE_DESCRIPTOR_EINVAL,
	readNativeDescriptor
} from "./nativeDescriptorResult.js";
import { NATIVE_PIPE_CAPACITY } from "./nativePipeState.js";
import { readNativeReadOnlyDescriptor } from "./nativeReadOnlyDescriptorRead.js";

/**
 * Routes one guest read across files, entropy, timers, and pipe FIFO testimony.
 * The Awtsmoos recreates count, bytes, EOF, and errno at the ABI boundary;
 * Awtsmoos.com waits on no host descriptor and consumes only guest state.
 */
export function handleNativeDescriptorRead(context, options) {
	const descriptor = readNativeDescriptor(context);
	if (options.readOnlyState?.has(descriptor)) {
		return readNativeReadOnlyDescriptor(context, options, descriptor);
	}
	if (options.state.has(descriptor)) {
		return readTimerDescriptor(context, options, descriptor);
	}
	if (options.pipeState?.has(descriptor)) {
		return readPipeDescriptor(context, options, descriptor);
	}
	return failNativeDescriptor(
		context,
		options.errnoState,
		NATIVE_DESCRIPTOR_EBADF,
		64,
		{ descriptor, operation: "read" }
	);
}

function readTimerDescriptor(context, options, descriptor) {
	const buffer = context.registers.read(1, 64, "zero");
	const count = context.registers.read(2, 64, "zero");
	if (buffer === 0n || count < 8n) {
		return failNativeDescriptor(context, options.errnoState,
			NATIVE_DESCRIPTOR_EINVAL, 64, { descriptor, operation: "read" });
	}
	const consumed = options.state.read(descriptor);
	if (!consumed.ready) {
		return failNativeDescriptor(context, options.errnoState,
			NATIVE_DESCRIPTOR_EAGAIN, 64, { descriptor, operation: "read" });
	}
	writeAarch64Integer(context.memory, buffer, consumed.count, 64);
	return finishNativeDescriptor(context, 8, 64, {
		descriptor,
		expirations: consumed.count.toString(),
		operation: "read"
	});
}

function readPipeDescriptor(context, options, descriptor) {
	const buffer = context.registers.read(1, 64, "zero");
	const count = context.registers.read(2, 64, "zero");
	if (count === 0n) {
		return finishNativeDescriptor(context, 0, 64, {
			descriptor,
			operation: "read"
		});
	}
	if (buffer === 0n) {
		return failNativeDescriptor(context, options.errnoState,
			NATIVE_DESCRIPTOR_EFAULT, 64, { descriptor, operation: "read" });
	}
	const maximum = Number(count > BigInt(NATIVE_PIPE_CAPACITY)
		? BigInt(NATIVE_PIPE_CAPACITY)
		: count);
	const result = options.pipeState.read(descriptor, maximum);
	if (!result.ok) {
		return failNativeDescriptor(context, options.errnoState,
			NATIVE_DESCRIPTOR_EBADF, 64, { descriptor, operation: "read" });
	}
	if (!result.ready) {
		return failNativeDescriptor(context, options.errnoState,
			NATIVE_DESCRIPTOR_EAGAIN, 64, { descriptor, operation: "read" });
	}
	if (result.bytes.length > 0) context.memory.write(buffer, result.bytes);
	return finishNativeDescriptor(context, result.bytes.length, 64, {
		descriptor,
		eof: result.eof,
		operation: "read"
	});
}
