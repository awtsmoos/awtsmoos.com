//B"H
//Boruch Hashem
//Blessed is He

import {
	NATIVE_MAP_FAILED,
	NATIVE_MMAP_ERRNO
} from "./nativeVirtualMemoryConstants.js";

/**
 * Registers mmap, mmap64, mprotect, and munmap over guest-owned virtual state.
 * The Awtsmoos renews X0, errno, page covenant, and X30 shore;
 * Awtsmoos.com returns no host mapping and invents no resident byte evermore.
 */
export function registerNativeMemoryMapHandlers(registry, options = {}) {
	registry.register("mmap", context => handleMmap(context, options, "mmap"));
	registry.register("mmap64", context => handleMmap(context, options, "mmap64"));
	registry.register("mprotect", context => handleMprotect(context, options));
	registry.register("munmap", context => handleMunmap(context, options));
}

function handleMmap(context, options, operation) {
	const request = Object.freeze({
		address: argument(context, 0),
		fd: argument(context, 4),
		flags: argument(context, 3),
		length: argument(context, 1),
		offset: argument(context, 5),
		protection: argument(context, 2)
	});
	const outcome = options.virtualMemory?.map(request)
		|| Object.freeze({ errno: NATIVE_MMAP_ERRNO.EINVAL, ok: false, reason: "state" });
	if (!outcome.ok) setErrno(context, options.errnoState, outcome.errno);
	return finish(context, outcome.ok ? outcome.address : NATIVE_MAP_FAILED, {
		address: outcome.ok ? outcome.address.toString() : NATIVE_MAP_FAILED.toString(),
		alignedLength: outcome.ok ? outcome.length.toString() : null,
		errno: outcome.ok ? 0 : outcome.errno,
		fd: Number(BigInt.asIntN(32, request.fd)),
		flags: Number(BigInt.asUintN(32, request.flags)),
		offset: BigInt.asIntN(64, request.offset).toString(),
		operation,
		protection: Number(BigInt.asUintN(32, request.protection)),
		reason: outcome.ok ? null : outcome.reason,
		requestedAddress: request.address.toString(),
		requestedLength: request.length.toString(),
		success: outcome.ok
	});
}

function handleMprotect(context, options) {
	const address = argument(context, 0);
	const length = argument(context, 1);
	const protection = argument(context, 2);
	const outcome = options.virtualMemory?.protect(address, length, protection)
		|| Object.freeze({ errno: NATIVE_MMAP_ERRNO.EINVAL, ok: false, reason: "state" });
	return finishInteger(context, options.errnoState, outcome, {
		address: address.toString(),
		length: length.toString(),
		operation: "mprotect",
		protection: Number(BigInt.asUintN(32, protection))
	});
}

function handleMunmap(context, options) {
	const address = argument(context, 0);
	const length = argument(context, 1);
	const outcome = options.virtualMemory?.unmap(address, length)
		|| Object.freeze({ errno: NATIVE_MMAP_ERRNO.EINVAL, ok: false, reason: "state" });
	return finishInteger(context, options.errnoState, outcome, {
		address: address.toString(),
		length: length.toString(),
		operation: "munmap"
	});
}

function finishInteger(context, errnoState, outcome, evidence) {
	if (!outcome.ok) setErrno(context, errnoState, outcome.errno);
	return finish(context, outcome.ok ? 0n : NATIVE_MAP_FAILED, {
		...evidence,
		errno: outcome.ok ? 0 : outcome.errno,
		reason: outcome.ok ? null : outcome.reason,
		success: outcome.ok
	});
}

function finish(context, value, evidence) {
	context.registers.write(0, value, 64, "zero");
	context.registers.pc = context.registers.read(30, 64, "zero");
	return Object.freeze(evidence);
}

function setErrno(context, errnoState, value) {
	if (!errnoState) return;
	const thread = context.systemRegisters?.read("TPIDR_EL0") || 0n;
	errnoState.set(thread, value);
}

function argument(context, index) {
	return context.registers.read(index, 64, "zero");
}
