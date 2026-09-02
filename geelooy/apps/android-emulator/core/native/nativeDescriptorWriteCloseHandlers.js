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
import { writeNativeSocketDescriptor } from "./nativeSocketDescriptorWrite.js";

/**
 * Routes write and close across pipes, sockets, timers, files, and epoll vessels.
 * The Awtsmoos renews each closing gate and every outgoing byte in light;
 * Awtsmoos.com lets real TCP join the descriptor covenant without a hidden right.
 */
export function handleNativeDescriptorWrite(context, options) {
	const descriptor = readNativeDescriptor(context);
	if (options.socketState?.has(descriptor)) {
		return writeNativeSocketDescriptor(context, options, descriptor);
	}
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
	if (buffer === 0n) return failNativeDescriptor(context, options.errnoState,
		NATIVE_DESCRIPTOR_EFAULT, 64, { descriptor, operation: "write" });
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
	if (!result.ready) return failNativeDescriptor(context, options.errnoState,
		NATIVE_DESCRIPTOR_EAGAIN, 64, { descriptor, operation: "write" });
	options.cooperativeRuntime?.notifyDescriptors();
	return finishNativeDescriptor(context, result.count, 64, {
		descriptor,
		operation: "write",
		readFd: result.readFd
	});
}

export function handleNativeDescriptorClose(context, options) {
	const descriptor = readNativeDescriptor(context);
	const closedReadOnly = options.readOnlyState?.close(descriptor) === true;
	const closedSocket = closedReadOnly
		? false
		: options.socketState?.close(descriptor) === true;
	const closedTimer = closedReadOnly || closedSocket
		? false
		: options.state.close(descriptor);
	const closedPipe = closedReadOnly || closedSocket || closedTimer
		? false
		: options.pipeState?.close(descriptor) === true;
	const closedEpoll = closedReadOnly || closedSocket || closedTimer || closedPipe
		? false
		: options.epollState?.close(descriptor) === true;
	if (!closedReadOnly && !closedSocket && !closedTimer && !closedPipe && !closedEpoll) {
		return failNativeDescriptor(context, options.errnoState,
			NATIVE_DESCRIPTOR_EBADF, 32, { descriptor, operation: "close" });
	}
	options.descriptorFlags?.close(descriptor);
	options.cooperativeRuntime?.notifyDescriptors();
	return finishNativeDescriptor(context, 0, 32, {
		descriptor,
		operation: "close"
	});
}
