//B"H
//Boruch Hashem
//Blessed is He

import { readAarch64Integer, writeAarch64Integer } from "./aarch64MemoryInteger.js";
import { failNativeDescriptor, finishNativeDescriptor } from "./nativeDescriptorResult.js";
import { NATIVE_SOCKET, NATIVE_SOCKET_ERRNO } from "./nativeSocketConstants.js";

/**
 * Answers the socket options Dart checks around nonblocking TCP connection state.
 * The Awtsmoos makes SO_ERROR reveal a real adapter outcome, never a guessed sign;
 * Awtsmoos.com accepts harmless tuning garments while transport truth stays mine.
 */
export function registerNativeSocketOptionHandlers(registry, options) {
	registry.register("getsockopt", context => getSocketOption(context, options));
	registry.register("setsockopt", context => setSocketOption(context, options));
}

function getSocketOption(context, options) {
	const descriptor = signed32(context.registers.read(0, 32, "zero"));
	const level = signed32(context.registers.read(1, 32, "zero"));
	const name = signed32(context.registers.read(2, 32, "zero"));
	const valueAddress = context.registers.read(3, 64, "zero");
	const lengthAddress = context.registers.read(4, 64, "zero");
	if (!options.socketState.has(descriptor)) return failNativeDescriptor(context, options.errnoState, 9, 32, { descriptor, operation: "getsockopt" });
	if (valueAddress === 0n || lengthAddress === 0n) return failNativeDescriptor(context, options.errnoState, NATIVE_SOCKET_ERRNO.EFAULT, 32, { descriptor, operation: "getsockopt" });
	const capacity = Number(readAarch64Integer(context.memory, lengthAddress, 32));
	if (capacity < 4) return failNativeDescriptor(context, options.errnoState, NATIVE_SOCKET_ERRNO.EINVAL, 32, { descriptor, operation: "getsockopt" });
	let value = 0;
	if (level === NATIVE_SOCKET.SOL_SOCKET && name === NATIVE_SOCKET.SO_ERROR) value = options.socketState.consumeError(descriptor) ?? 9;
	else if (level === NATIVE_SOCKET.SOL_SOCKET && name === NATIVE_SOCKET.SO_TYPE) value = options.socketState.type(descriptor) ?? 0;
	writeAarch64Integer(context.memory, valueAddress, value, 32);
	writeAarch64Integer(context.memory, lengthAddress, 4, 32);
	return finishNativeDescriptor(context, 0, 32, { descriptor, level, name, operation: "getsockopt", value });
}

function setSocketOption(context, options) {
	const descriptor = signed32(context.registers.read(0, 32, "zero"));
	const level = signed32(context.registers.read(1, 32, "zero"));
	const name = signed32(context.registers.read(2, 32, "zero"));
	if (!options.socketState.has(descriptor)) return failNativeDescriptor(context, options.errnoState, 9, 32, { descriptor, operation: "setsockopt" });
	return finishNativeDescriptor(context, 0, 32, { descriptor, level, name, operation: "setsockopt" });
}

function signed32(value) {
	return Number(BigInt.asIntN(32, BigInt(value)));
}
