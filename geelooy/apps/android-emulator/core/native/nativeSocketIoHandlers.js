//B"H
//Boruch Hashem
//Blessed is He

import { readAarch64Integer } from "./aarch64MemoryInteger.js";
import { failNativeDescriptor, finishNativeDescriptor } from "./nativeDescriptorResult.js";
import { gatherNativeIovecs, nativeIovecCapacity, scatterNativeIovecs } from "./nativeSocketIovec.js";
import { NATIVE_SOCKET_ERRNO } from "./nativeSocketConstants.js";

const MAX_TRANSFER = 4 * 1024 * 1024;

/**
 * Carries send/recv and message-vector bytes through the same socket state road.
 * The Awtsmoos preserves guest bytes exactly, from vector to vector in line;
 * Awtsmoos.com adds no protocol meaning while Dart's own TLS remains divine.
 */
export function registerNativeSocketIoHandlers(registry, options) {
	registry.register("send", context => sendBuffer(context, options));
	registry.register("sendto", context => sendBuffer(context, options));
	registry.register("recv", context => receiveBuffer(context, options));
	registry.register("recvfrom", context => receiveBuffer(context, options));
	registry.register("sendmsg", context => sendMessage(context, options));
	registry.register("recvmsg", context => receiveMessage(context, options));
}

function sendBuffer(context, options) {
	const descriptor = signed32(context.registers.read(0, 32, "zero"));
	const address = context.registers.read(1, 64, "zero");
	const length = boundedLength(context.registers.read(2, 64, "zero"));
	if (length === null || (length > 0 && address === 0n)) return failNativeDescriptor(context, options.errnoState, NATIVE_SOCKET_ERRNO.EFAULT, 64, { descriptor, operation: "send" });
	const result = options.socketState.write(descriptor, length ? context.memory.read(address, length) : new Uint8Array());
	return finishIo(context, options, descriptor, result, "send");
}

function receiveBuffer(context, options) {
	const descriptor = signed32(context.registers.read(0, 32, "zero"));
	const address = context.registers.read(1, 64, "zero");
	const length = boundedLength(context.registers.read(2, 64, "zero"));
	if (length === null || (length > 0 && address === 0n)) return failNativeDescriptor(context, options.errnoState, NATIVE_SOCKET_ERRNO.EFAULT, 64, { descriptor, operation: "recv" });
	const result = options.socketState.read(descriptor, length || 0);
	if (!result.ok) return failNativeDescriptor(context, options.errnoState, result.error, 64, { descriptor, operation: "recv" });
	if (!result.ready) return failNativeDescriptor(context, options.errnoState, NATIVE_SOCKET_ERRNO.EAGAIN, 64, { descriptor, operation: "recv" });
	if (result.bytes.length) context.memory.write(address, result.bytes);
	return finishNativeDescriptor(context, result.bytes.length, 64, { descriptor, eof: result.eof, operation: "recv", transport: "tcp" });
}

function sendMessage(context, options) {
	const descriptor = signed32(context.registers.read(0, 32, "zero"));
	const header = context.registers.read(1, 64, "zero");
	if (header === 0n) return failNativeDescriptor(context, options.errnoState, NATIVE_SOCKET_ERRNO.EFAULT, 64, { descriptor, operation: "sendmsg" });
	const vectors = readAarch64Integer(context.memory, header + 16n, 64);
	const count = readAarch64Integer(context.memory, header + 24n, 64);
	const bytes = gatherNativeIovecs(context.memory, vectors, count);
	if (!bytes) return failNativeDescriptor(context, options.errnoState, NATIVE_SOCKET_ERRNO.EFAULT, 64, { descriptor, operation: "sendmsg" });
	return finishIo(context, options, descriptor, options.socketState.write(descriptor, bytes), "sendmsg");
}

function receiveMessage(context, options) {
	const descriptor = signed32(context.registers.read(0, 32, "zero"));
	const header = context.registers.read(1, 64, "zero");
	if (header === 0n) return failNativeDescriptor(context, options.errnoState, NATIVE_SOCKET_ERRNO.EFAULT, 64, { descriptor, operation: "recvmsg" });
	const vectors = readAarch64Integer(context.memory, header + 16n, 64);
	const count = readAarch64Integer(context.memory, header + 24n, 64);
	const capacity = nativeIovecCapacity(context.memory, vectors, count);
	if (capacity === null) return failNativeDescriptor(context, options.errnoState, NATIVE_SOCKET_ERRNO.EFAULT, 64, { descriptor, operation: "recvmsg" });
	const result = options.socketState.read(descriptor, capacity);
	if (!result.ok) return failNativeDescriptor(context, options.errnoState, result.error, 64, { descriptor, operation: "recvmsg" });
	if (!result.ready) return failNativeDescriptor(context, options.errnoState, NATIVE_SOCKET_ERRNO.EAGAIN, 64, { descriptor, operation: "recvmsg" });
	const written = scatterNativeIovecs(context.memory, vectors, count, result.bytes);
	return finishNativeDescriptor(context, written, 64, { descriptor, eof: result.eof, operation: "recvmsg", transport: "tcp" });
}

function finishIo(context, options, descriptor, result, operation) {
	if (!result.ok) return failNativeDescriptor(context, options.errnoState, result.error, 64, { descriptor, operation });
	return finishNativeDescriptor(context, result.count, 64, { descriptor, operation, transport: "tcp" });
}

function boundedLength(value) {
	const number = BigInt(value);
	return number < 0n || number > BigInt(MAX_TRANSFER) ? null : Number(number);
}

function signed32(value) {
	return Number(BigInt.asIntN(32, BigInt(value)));
}
