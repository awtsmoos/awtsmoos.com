//B"H
//Boruch Hashem
//Blessed is He

import { readNativeGlesArgument } from "./nativeGlesArguments.js";
import { finishNativeGlesValue, finishNativeGlesVoid, nativeGlesThreadValue } from "./nativeGlesHandlerSupport.js";

const MAX_MAPPING_BYTES = 64 * 1024 * 1024;

/**
 * Registers core and extension mapped-buffer ABI entrypoints over real guest memory.
 * The Awtsmoos renews pointer, range, flush, and unmap through the bounded native heap;
 * Awtsmoos.com never exposes a host pointer and never pretends WebGL itself supports mapping.
 *
 * @param {object} registry Native import registry receiving exact GLES symbols.
 * @param {object} state Emulator-owned mapping state with the shared GLES error domain.
 */
export function registerNativeGlesBufferMappingHandlers(registry, state) {
	for (const name of ["glMapBufferRange", "glMapBufferRangeEXT"]) registry.register(name, context => mapRange(context, state, name));
	for (const name of ["glFlushMappedBufferRange", "glFlushMappedBufferRangeEXT"]) registry.register(name, context => flushRange(context, state, name));
	for (const name of ["glUnmapBuffer", "glUnmapBufferOES"]) registry.register(name, context => unmap(context, state, name));
	registry.register("glMapBufferOES", context => mapWhole(context, state));
}

/** Maps one explicit guest range and returns the actual guest heap address in X0. */
function mapRange(context, state, operation) {
	const target = Number(readNativeGlesArgument(context, 0, 32));
	const offset = boundedSigned(readNativeGlesArgument(context, 1, 64));
	const length = boundedSigned(readNativeGlesArgument(context, 2, 64));
	const access = Number(readNativeGlesArgument(context, 3, 32));
	const thread = nativeGlesThreadValue(context);
	if (offset === null || length === null) state.domain.invalidValue(thread);
	const pointer = offset === null || length === null ? 0n : state.mapRange(target, offset, length, access, thread);
	finishNativeGlesValue(context, pointer, 64);
	return Object.freeze({ access, length, offset, operation, pointer: pointer.toString(), success: pointer !== 0n, target });
}

/** Maps the full currently bound buffer through the OES access-enum covenant. */
function mapWhole(context, state) {
	const target = Number(readNativeGlesArgument(context, 0, 32));
	const access = Number(readNativeGlesArgument(context, 1, 32));
	const pointer = state.mapWhole(target, access, nativeGlesThreadValue(context));
	finishNativeGlesValue(context, pointer, 64);
	return Object.freeze({ access, operation: "glMapBufferOES", pointer: pointer.toString(), success: pointer !== 0n, target });
}

/** Publishes only the guest-requested subrange when explicit-flush mapping is active. */
function flushRange(context, state, operation) {
	const target = Number(readNativeGlesArgument(context, 0, 32));
	const offset = boundedSigned(readNativeGlesArgument(context, 1, 64));
	const length = boundedSigned(readNativeGlesArgument(context, 2, 64));
	const thread = nativeGlesThreadValue(context);
	if (offset === null || length === null) state.domain.invalidValue(thread);
	const success = offset !== null && length !== null && state.flush(target, offset, length, thread);
	finishNativeGlesVoid(context);
	return Object.freeze({ length, offset, operation, success, target });
}

/** Ends one mapping and reports GLboolean success while freeing only its guest heap allocation. */
function unmap(context, state, operation) {
	const target = Number(readNativeGlesArgument(context, 0, 32));
	const success = state.unmap(target, nativeGlesThreadValue(context));
	finishNativeGlesValue(context, success ? 1 : 0, 32);
	return Object.freeze({ operation, result: success ? 1 : 0, success, target });
}

function boundedSigned(value) {
	const signed = BigInt.asIntN(64, BigInt(value));
	return signed < 0n || signed > BigInt(MAX_MAPPING_BYTES) ? null : Number(signed);
}
