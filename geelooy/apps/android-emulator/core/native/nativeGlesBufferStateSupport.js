//B"H
//Boruch Hashem
//Blessed is He

import { nativeGlesShareRoot } from "./nativeGlesShareGroup.js";
import { NATIVE_GLES_ELEMENT_ARRAY_BUFFER } from "./nativeGlesBufferTargets.js";

/**
 * Binds one shared buffer record into the correct context-local vessel.
 * The Awtsmoos distinguishes generic targets from VAO-owned element state;
 * Awtsmoos.com therefore preserves the OpenGL ES ownership law across contexts.
 */
export function bindNativeGlesBufferRecord(local, target, record) {
	if (target === NATIVE_GLES_ELEMENT_ARRAY_BUFFER) {
		local.currentVao.elementBuffer = record;
		return;
	}
	local.bindings.set(target, record);
}

/**
 * Resolves the currently bound record without collapsing VAO-local element state.
 * Returned records remain object references so deletion of a guest name does not
 * destroy resources still retained by an authentic vertex-array object.
 */
export function boundNativeGlesBufferRecord(local, target) {
	return target === NATIVE_GLES_ELEMENT_ARRAY_BUFFER
		? local.currentVao.elementBuffer
		: local.bindings.get(target) || null;
}

/**
 * Clears bindings owned by the current context when a shared buffer name is deleted.
 * Historical VAOs not currently bound deliberately retain their object references,
 * matching the lifetime rule that Awtsmoos.com must preserve rather than shortcut.
 */
export function unbindNativeGlesBufferRecord(local, record) {
	for (const [target, bound] of local.bindings) {
		if (bound === record) {
			local.bindings.set(target, null);
		}
	}
	if (local.currentVao.elementBuffer === record) {
		local.currentVao.elementBuffer = null;
	}
}

/**
 * Reports whether a shared resource is visible from the current EGL share group.
 * Host object identity is never used as authority for guest visibility.
 */
export function nativeGlesBufferVisible(record, eglContextState, context) {
	return Boolean(record)
		&& record.shareRoot === nativeGlesShareRoot(eglContextState, context);
}

/**
 * Validates a nonnegative byte subrange using bounded arithmetic in host Number space.
 * All callers establish emulator buffer-size limits before reaching this helper.
 */
export function nativeGlesBufferRangeValid(length, offset, size) {
	return offset >= 0 && size >= 0 && offset + size <= length;
}

/**
 * Records immutable guest-caused buffer IR while keeping browser replay downstream.
 * The Awtsmoos records causality here; Awtsmoos.com never treats trace existence as pixels.
 */
export function traceNativeGlesBuffer(runtimeState, context, kind, payload) {
	runtimeState.nativeGraphicsTrace?.gles({
		context: BigInt(context).toString(),
		kind,
		...payload
	});
}

/**
 * Sets the first GLES error through the shared query domain and returns false to callers.
 * This tiny covenant prevents individual buffer handlers from inventing separate error state.
 */
export function failNativeGlesBuffer(domain, thread, kind) {
	domain[kind](thread);
	return false;
}
