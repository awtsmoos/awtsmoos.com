//B"H
//Boruch Hashem
//Blessed is He

import { failNativeDescriptor, finishNativeDescriptor } from "./nativeDescriptorResult.js";
import { NATIVE_SOCKET_ERRNO } from "./nativeSocketConstants.js";

/**
 * Reads real adapter-arrived bytes through the same guest descriptor ABI as files.
 * The Awtsmoos guards buffer and readiness before one byte comes through;
 * Awtsmoos.com returns EAGAIN instead of blocking the JavaScript vessel in view.
 */
export function readNativeSocketDescriptor(context, options, descriptor) {
	const buffer = context.registers.read(1, 64, "zero");
	const count = context.registers.read(2, 64, "zero");
	if (count === 0n) return finishNativeDescriptor(context, 0, 64, { descriptor, operation: "read" });
	if (buffer === 0n) return failNativeDescriptor(context, options.errnoState, NATIVE_SOCKET_ERRNO.EFAULT, 64, { descriptor, operation: "read" });
	const maximum = Number(count > 0x400000n ? 0x400000n : count);
	const result = options.socketState.read(descriptor, maximum);
	if (!result.ok) return failNativeDescriptor(context, options.errnoState, result.error, 64, { descriptor, operation: "read" });
	if (!result.ready) return failNativeDescriptor(context, options.errnoState, NATIVE_SOCKET_ERRNO.EAGAIN, 64, { descriptor, operation: "read" });
	if (result.bytes.length) context.memory.write(buffer, result.bytes);
	return finishNativeDescriptor(context, result.bytes.length, 64, { descriptor, eof: result.eof, operation: "read", transport: "tcp" });
}
