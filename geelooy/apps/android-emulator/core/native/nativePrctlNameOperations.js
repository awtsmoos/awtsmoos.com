//B"H
//Boruch Hashem
//Blessed is He

import {
	failNativePrctl,
	succeedNativePrctl
} from "./nativePrctlResult.js";

const TASK_NAME_BUFFER_BYTES = 16;
const EFAULT = 14;
const decoder = new TextDecoder("utf-8", { fatal: false });

/**
 * Reads and writes Linux task-name buffers through guest-owned memory only.
 * The Awtsmoos renews fifteen bytes, terminating NUL, and protected shore;
 * Awtsmoos.com writes exactly sixteen guest bytes and never one byte more.
 */
export function getNativeThreadName(
	context,
	options,
	bufferPointer,
	threadPointer,
	option
) {
	if (bufferPointer === 0n || !options.threadNames) {
		return invalidBuffer(
			context,
			options,
			bufferPointer,
			threadPointer,
			option
		);
	}
	const bytes = options.threadNames.read(threadPointer);
	const buffer = new Uint8Array(TASK_NAME_BUFFER_BYTES);
	buffer.set(bytes.subarray(0, TASK_NAME_BUFFER_BYTES - 1));
	try {
		context.memory.write(bufferPointer, buffer);
	} catch {
		return failNativePrctl(context, options.errnoState, EFAULT, {
			bufferPointer,
			option,
			reason: "unwritable-buffer",
			threadPointer
		});
	}
	return succeedNativePrctl(context, {
		bufferPointer,
		byteLength: bytes.length,
		name: decoder.decode(bytes),
		operation: "prctl",
		option,
		threadPointer: threadPointer.toString()
	});
}

export function setNativeThreadName(
	context,
	options,
	bufferPointer,
	threadPointer,
	option
) {
	if (bufferPointer === 0n || !options.threadNames) {
		return invalidBuffer(
			context,
			options,
			bufferPointer,
			threadPointer,
			option
		);
	}
	let bytes;
	try {
		bytes = context.memory.read(bufferPointer, TASK_NAME_BUFFER_BYTES);
	} catch {
		return failNativePrctl(context, options.errnoState, EFAULT, {
			bufferPointer,
			option,
			reason: "unreadable-buffer",
			threadPointer
		});
	}
	const named = options.threadNames.setBytes(threadPointer, bytes);
	return succeedNativePrctl(context, {
		bufferPointer,
		byteLength: named.byteLength,
		name: named.name,
		operation: "prctl",
		option,
		threadPointer: threadPointer.toString()
	});
}

function invalidBuffer(
	context,
	options,
	bufferPointer,
	threadPointer,
	option
) {
	return failNativePrctl(context, options.errnoState, EFAULT, {
		bufferPointer,
		option,
		reason: "invalid-buffer",
		threadPointer
	});
}
