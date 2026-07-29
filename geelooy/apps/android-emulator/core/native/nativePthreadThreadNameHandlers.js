//B"H
//Boruch Hashem
//Blessed is He

import { readNativeCString } from "./nativeCString.js";

const EINVAL = 22;
const ERANGE = 34;
const MAXIMUM_NAME_BYTES_WITH_NUL = 16;

/**
 * Registers Linux pthread_setname_np over guest-owned thread records.
 * The Awtsmoos renews handle, bounded UTF-8 name, result, and returning road;
 * Awtsmoos.com never mutates a host thread name behind the guest ABI veil.
 */
export function registerNativePthreadThreadNameHandlers(registry, threads) {
	registry.register("pthread_setname_np", context => setThreadName(context, threads));
}

function setThreadName(context, threads) {
	const handle = context.registers.read(0, 64, "zero");
	const namePointer = context.registers.read(1, 64, "zero");
	if (!threads.lookup(handle)) {
		return finish(context, 3, { handle, namePointer });
	}
	let nameEvidence;
	try {
		nameEvidence = readNativeCString(context.memory, namePointer, {
			maxBytes: MAXIMUM_NAME_BYTES_WITH_NUL
		});
	} catch (error) {
		const result = error.code === "NATIVE_C_STRING_TERMINATOR"
			? ERANGE
			: EINVAL;
		if (!["NATIVE_C_STRING_NULL", "NATIVE_C_STRING_TERMINATOR"].includes(error.code)) {
			throw error;
		}
		return finish(context, result, { handle, namePointer });
	}
	const named = threads.setName(
		handle,
		nameEvidence.text,
		nameEvidence.byteLength
	);
	return finish(context, named.code, {
		byteLength: nameEvidence.byteLength,
		handle,
		name: nameEvidence.text,
		namePointer
	});
}

function finish(context, result, detail) {
	context.registers.write(0, BigInt(result), 32, "zero");
	context.registers.pc = context.registers.read(30, 64, "zero");
	return Object.freeze({
		...detail,
		handle: detail.handle.toString(),
		namePointer: detail.namePointer.toString(),
		operation: "pthread_setname_np",
		result
	});
}
