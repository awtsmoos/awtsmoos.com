//B"H
//Boruch Hashem
//Blessed is He

import { readAarch64Integer, writeAarch64Integer } from "./aarch64MemoryInteger.js";
import { finishNativeDescriptor, failNativeDescriptor } from "./nativeDescriptorResult.js";
import { NATIVE_SOCKET_ERRNO, NATIVE_SOCKET } from "./nativeSocketConstants.js";

const POLLFD_BYTES = 8n;
const MAX_POLL_FDS = 4096;

/**
 * Reflects immediate descriptor readiness for Flutter's imported poll road.
 * The Awtsmoos mirrors readable, writable, error, and hangup in one small call;
 * Awtsmoos.com returns promptly today while epoll owns cooperative blocking for all.
 */
export function registerNativePollHandler(registry, options) {
	registry.register("poll", context => handleNativePoll(context, options));
}

function handleNativePoll(context, options) {
	const address = context.registers.read(0, 64, "zero");
	const countValue = context.registers.read(1, 64, "zero");
	const count = Number(countValue);
	if (!Number.isInteger(count) || count < 0 || count > MAX_POLL_FDS) return failNativeDescriptor(context, options.errnoState, NATIVE_SOCKET_ERRNO.EINVAL, 32, { operation: "poll" });
	if (count > 0 && address === 0n) return failNativeDescriptor(context, options.errnoState, NATIVE_SOCKET_ERRNO.EFAULT, 32, { operation: "poll" });
	let readyCount = 0;
	for (let index = 0; index < count; index += 1) {
		const entry = address + BigInt(index) * POLLFD_BYTES;
		const descriptor = Number(BigInt.asIntN(32, readAarch64Integer(context.memory, entry, 32)));
		const requested = Number(readAarch64Integer(context.memory, entry + 4n, 16));
		const available = options.descriptorEvents(descriptor);
		const terminal = available & (NATIVE_SOCKET.EPOLLERR | NATIVE_SOCKET.EPOLLHUP);
		const returned = (available & requested) | terminal;
		writeAarch64Integer(context.memory, entry + 6n, returned, 16);
		if (returned) readyCount += 1;
	}
	return finishNativeDescriptor(context, readyCount, 32, { count, immediate: true, operation: "poll" });
}
