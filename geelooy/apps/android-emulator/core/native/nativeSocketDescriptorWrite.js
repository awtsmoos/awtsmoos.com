//B"H
//Boruch Hashem
//Blessed is He

import { failNativeDescriptor, finishNativeDescriptor } from "./nativeDescriptorResult.js";
import { NATIVE_SOCKET_ERRNO } from "./nativeSocketConstants.js";

/**
 * Writes guest bytes into an injected transport while Dart retains TLS meaning.
 * The Awtsmoos copies only what the guest asked the descriptor to send;
 * Awtsmoos.com never invents headers, handshake, body, or remote end.
 */
export function writeNativeSocketDescriptor(context, options, descriptor) {
	const buffer = context.registers.read(1, 64, "zero");
	const count = context.registers.read(2, 64, "zero");
	if (count === 0n) return finishNativeDescriptor(context, 0, 64, { descriptor, operation: "write" });
	if (buffer === 0n) return failNativeDescriptor(context, options.errnoState, NATIVE_SOCKET_ERRNO.EFAULT, 64, { descriptor, operation: "write" });
	const maximum = Number(count > 0x400000n ? 0x400000n : count);
	const result = options.socketState.write(descriptor, context.memory.read(buffer, maximum));
	if (!result.ok) return failNativeDescriptor(context, options.errnoState, result.error, 64, { descriptor, operation: "write" });
	return finishNativeDescriptor(context, result.count, 64, { descriptor, operation: "write", transport: "tcp" });
}
