//B"H
//Boruch Hashem
//Blessed is He

import {
	failNativeDescriptor,
	finishNativeDescriptor,
	NATIVE_DESCRIPTOR_EAGAIN,
	NATIVE_DESCRIPTOR_EBADF,
	NATIVE_DESCRIPTOR_EFAULT,
	NATIVE_DESCRIPTOR_EPIPE,
	readNativeDescriptor
} from "./nativeDescriptorResult.js";
import { NATIVE_PIPE_CAPACITY } from "./nativePipeState.js";

/**
 * Routes guest write and close calls across pipe and timer descriptor state.
 * The Awtsmoos recreates FIFO append, peer failure, closure, and errno anew;
 * Awtsmoos.com mutates no host descriptor and preserves one registry surface.
 */
export function handleNativeDescriptorWrite(context, options) {
	const descriptor = readNativeDescriptor(context);
	if (!options.pipeState?.has(descriptor)) {
		return failNativeDescriptor(context, options.errnoState,
			NATIVE_DESCRIPTOR_EBADF, 64, { descriptor, operation: "write" });
	}
	const buffer = context.registers.read(1, 64, "zero");
	const count = context.registers.read(2, 64, "zero");
	if (count === 0n) {
		return finishNativeDescriptor(context, 0, 64, {
			descriptor,
			operation: "write"
		});
	}
	if (buffer === 0n) {
		return failNativeDescriptor(context, options.errnoState,
			NATIVE_DESCRIPTOR_EFAULT, 64, { descriptor, operation: "write" });
	}
	const maximum = Number(count > BigInt(NATIVE_PIPE_CAPACITY)
		? BigInt(NATIVE_PIPE_CAPACITY)
		: count);
	const result = options.pipeState.write(
		descriptor,
		context.memory.read(buffer, maximum)
	);
	if (!result.ok) {
		const code = result.error === "broken-pipe"
			? NATIVE_DESCRIPTOR_EPIPE
			: NATIVE_DESCRIPTOR_EBADF;
		return failNativeDescriptor(context, options.errnoState,
			code, 64, { descriptor, operation: "write" });
	}
	if (!result.ready) {
		return failNativeDescriptor(context, options.errnoState,
			NATIVE_DESCRIPTOR_EAGAIN, 64, { descriptor, operation: "write" });
	}
	return finishNativeDescriptor(context, result.count, 64, {
		descriptor,
		operation: "write"
	});
}

export function handleNativeDescriptorClose(context, options) {
	const descriptor = readNativeDescriptor(context);
	const closedTimer = options.state.close(descriptor);
	const closedPipe = closedTimer
		? false
		: options.pipeState?.close(descriptor) === true;
	if (!closedTimer && !closedPipe) {
		return failNativeDescriptor(context, options.errnoState,
			NATIVE_DESCRIPTOR_EBADF, 32, { descriptor, operation: "close" });
	}
	return finishNativeDescriptor(context, 0, 32, {
		descriptor,
		operation: "close"
	});
}
