//B"H
//Boruch Hashem
//Blessed is He

import { readNativeGlesArgument } from "./nativeGlesArguments.js";
import { finishNativeGlesVoid, nativeGlesThreadValue } from "./nativeGlesHandlerSupport.js";

/**
 * Registers indexed buffer ABI entrypoints with exact AAPCS64 offset/size decoding.
 * The Awtsmoos renews UBO, SSBO, transform-feedback and atomic-counter slots while
 * Awtsmoos.com lets state validation reject invalid ranges without browser fabrication.
 */
export function registerNativeGlesIndexedBufferHandlers(registry, state) {
	registry.register("glBindBufferBase", context => bindBase(context, state));
	registry.register("glBindBufferRange", context => bindRange(context, state));
}

/** Handles glBindBufferBase and publishes the generic-plus-indexed GLES side effect. */
function bindBase(context, state) {
	const target = u32(context, 0);
	const index = u32(context, 1);
	const buffer = u32(context, 2);
	const success = state.bindBase(target, index, buffer, nativeGlesThreadValue(context));
	finishNativeGlesVoid(context);
	return Object.freeze({ buffer, index, operation: "glBindBufferBase", success, target });
}

/** Handles glBindBufferRange with signed 64-bit guest offsets and allocation bounds. */
function bindRange(context, state) {
	const target = u32(context, 0);
	const index = u32(context, 1);
	const buffer = u32(context, 2);
	const offset = signed64(context, 3);
	const size = signed64(context, 4);
	const success = state.bindRange(target, index, buffer, offset, size, nativeGlesThreadValue(context));
	finishNativeGlesVoid(context);
	return Object.freeze({ buffer, index, offset, operation: "glBindBufferRange", size, success, target });
}

/** Reads one unsigned GLenum/GLuint argument from the general register stream. */
function u32(context, index) {
	return Number(readNativeGlesArgument(context, index, 32));
}

/** Reads one GLintptr/GLsizeiptr using signed AArch64 64-bit interpretation. */
function signed64(context, index) {
	return Number(BigInt.asIntN(64, readNativeGlesArgument(context, index, 64)));
}
