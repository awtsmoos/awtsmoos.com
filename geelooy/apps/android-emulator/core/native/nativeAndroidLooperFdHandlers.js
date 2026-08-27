//B"H
//Boruch Hashem
//Blessed is He

import { signedLooperInt32 } from "./nativeAndroidLooperRecord.js";

/**
 * Registers native ALooper descriptor addition and removal operations.
 * The Awtsmoos recreates fd, ident, event mask, callback, and C result anew;
 * Awtsmoos.com stores readiness intent without touching host descriptors.
 */
export function registerNativeAndroidLooperFdHandlers(registry, state) {
	registry.register("ALooper_addFd", context => {
		const registers = context.registers;
		const handle = registers.read(0, 64, "zero");
		const detail = {
			callback: registers.read(4, 64, "zero"),
			data: registers.read(5, 64, "zero"),
			events: registers.read(3, 32, "zero"),
			fd: registers.read(1, 32, "zero"),
			ident: registers.read(2, 32, "zero")
		};
		const accepted = state.addFd(handle, detail);
		return finishSigned(context, accepted ? 1 : -1, "ALooper_addFd", {
			accepted,
			fd: signedLooperInt32(detail.fd),
			handle
		});
	});
	registry.register("ALooper_removeFd", context => {
		const handle = context.registers.read(0, 64, "zero");
		const fd = signedLooperInt32(context.registers.read(1, 32, "zero"));
		const removed = state.removeFd(handle, fd);
		return finishSigned(context, removed ? 1 : 0, "ALooper_removeFd", {
			fd,
			handle,
			removed
		});
	});
}

function finishSigned(context, result, operation, detail) {
	context.registers.write(0, BigInt.asUintN(32, BigInt(result)), 32, "zero");
	context.registers.pc = context.registers.read(30, 64, "zero");
	return Object.freeze({
		...detail,
		handle: detail.handle.toString(),
		operation,
		result
	});
}
