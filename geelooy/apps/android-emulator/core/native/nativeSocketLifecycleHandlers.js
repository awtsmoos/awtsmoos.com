//B"H
//Boruch Hashem
//Blessed is He

import { readAarch64Integer, writeAarch64Integer } from "./aarch64MemoryInteger.js";
import { NATIVE_DESCRIPTOR_ACCESS } from "./nativeDescriptorFlagState.js";
import { failNativeDescriptor, finishNativeDescriptor } from "./nativeDescriptorResult.js";
import { readNativeSocketAddress, writeNativeSocketAddress, NATIVE_SOCKADDR_IN_BYTES } from "./nativeSocketAddress.js";
import { NATIVE_SOCKET_ERRNO } from "./nativeSocketConstants.js";

/**
 * Registers socket creation, nonblocking connection, shutdown, and peer testimony.
 * The Awtsmoos lets Linux-visible state rise from one virtual descriptor sea;
 * Awtsmoos.com starts transport only when the guest itself invokes connect freely.
 */
export function registerNativeSocketLifecycleHandlers(registry, options) {
	registry.register("socket", context => createSocket(context, options));
	registry.register("connect", context => connectSocket(context, options));
	registry.register("shutdown", context => shutdownSocket(context, options));
	registry.register("getsockname", context => writeSocketName(context, options, false));
	registry.register("getpeername", context => writeSocketName(context, options, true));
}

function createSocket(context, options) {
	const domain = signed32(context.registers.read(0, 32, "zero"));
	const type = signed32(context.registers.read(1, 32, "zero"));
	const protocol = signed32(context.registers.read(2, 32, "zero"));
	const result = options.socketState.create(domain, type, protocol);
	if (!result.ok) return failNativeDescriptor(context, options.errnoState, result.error, 32, { domain, operation: "socket", protocol, type });
	options.descriptorFlags?.create(result.fd, { accessMode: NATIVE_DESCRIPTOR_ACCESS.READ_WRITE, flags: type });
	return finishNativeDescriptor(context, result.fd, 32, { descriptor: result.fd, domain, operation: "socket", protocol, type });
}

function connectSocket(context, options) {
	const descriptor = signed32(context.registers.read(0, 32, "zero"));
	const address = context.registers.read(1, 64, "zero");
	const length = context.registers.read(2, 32, "zero");
	const target = readNativeSocketAddress(context.memory, address, length, options.socketState.dns);
	if (!target?.host) return failNativeDescriptor(context, options.errnoState, NATIVE_SOCKET_ERRNO.EAFNOSUPPORT, 32, { descriptor, operation: "connect" });
	const result = options.socketState.connect(descriptor, target);
	if (!result.ok) return failNativeDescriptor(context, options.errnoState, result.error, 32, { descriptor, operation: "connect", target });
	return failNativeDescriptor(context, options.errnoState, NATIVE_SOCKET_ERRNO.EINPROGRESS, 32, { descriptor, operation: "connect", target });
}

function shutdownSocket(context, options) {
	const descriptor = signed32(context.registers.read(0, 32, "zero"));
	const result = options.socketState.shutdown(descriptor);
	if (!result.ok) return failNativeDescriptor(context, options.errnoState, result.error, 32, { descriptor, operation: "shutdown" });
	return finishNativeDescriptor(context, 0, 32, { descriptor, operation: "shutdown" });
}

function writeSocketName(context, options, peer) {
	const descriptor = signed32(context.registers.read(0, 32, "zero"));
	const address = context.registers.read(1, 64, "zero");
	const lengthAddress = context.registers.read(2, 64, "zero");
	if (address === 0n || lengthAddress === 0n) return failNativeDescriptor(context, options.errnoState, NATIVE_SOCKET_ERRNO.EFAULT, 32, { descriptor, operation: peer ? "getpeername" : "getsockname" });
	const capacity = Number(readAarch64Integer(context.memory, lengthAddress, 32));
	if (capacity < NATIVE_SOCKADDR_IN_BYTES) return failNativeDescriptor(context, options.errnoState, NATIVE_SOCKET_ERRNO.EINVAL, 32, { descriptor, operation: "socket-name" });
	const target = peer ? options.socketState.peer(descriptor) : { address: "0.0.0.0", port: 0 };
	if (!target) return failNativeDescriptor(context, options.errnoState, NATIVE_SOCKET_ERRNO.ENOTCONN, 32, { descriptor, operation: "getpeername" });
	writeNativeSocketAddress(context.memory, address, target);
	writeAarch64Integer(context.memory, lengthAddress, NATIVE_SOCKADDR_IN_BYTES, 32);
	return finishNativeDescriptor(context, 0, 32, { descriptor, operation: peer ? "getpeername" : "getsockname" });
}

function signed32(value) {
	return Number(BigInt.asIntN(32, BigInt(value)));
}
