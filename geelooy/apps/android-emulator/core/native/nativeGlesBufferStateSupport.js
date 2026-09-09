//B"H
//Boruch Hashem
//Blessed is He

import { nativeGlesShareRoot } from "./nativeGlesShareGroup.js";
import { NATIVE_GLES_ELEMENT_ARRAY_BUFFER } from "./nativeGlesBufferTargets.js";

/** Binds one shared buffer record to the current context or current VAO element slot. */
export function bindNativeGlesBufferRecord(local, target, record) {
	if (target === NATIVE_GLES_ELEMENT_ARRAY_BUFFER) local.currentVao.elementBuffer = record;
	else local.bindings.set(target, record);
}

/** Resolves the buffer record visible through one generic target in the current context. */
export function boundNativeGlesBufferRecord(local, target) {
	return target === NATIVE_GLES_ELEMENT_ARRAY_BUFFER
		? local.currentVao.elementBuffer
		: local.bindings.get(target) || null;
}

/**
 * Removes every context-owned reference that deletion must reset to zero.
 * Attribute records intentionally retain their object reference because GLES deletion
 * defers object destruction while a VAO still owns an attachment to that object.
 */
export function unbindNativeGlesBufferRecord(local, record) {
	for (const [target, bound] of local.bindings) {
		if (bound === record) local.bindings.set(target, null);
	}
	for (const [key, binding] of local.indexedBindings) {
		if (binding?.record === record) local.indexedBindings.delete(key);
	}
	if (local.currentVao.elementBuffer === record) local.currentVao.elementBuffer = null;
}

/** Returns whether a shared buffer object belongs to the current context's share group. */
export function nativeGlesBufferVisible(record, eglContextState, context) {
	return Boolean(record) && record.shareRoot === nativeGlesShareRoot(eglContextState, context);
}

/** Validates an offset/size pair without permitting negative or overflowing subranges. */
export function nativeGlesBufferRangeValid(length, offset, size) {
	return offset >= 0 && size >= 0 && offset + size <= length;
}

/** Emits one immutable guest-originated buffer operation into the graphics trace. */
export function traceNativeGlesBuffer(runtimeState, context, kind, payload) {
	runtimeState.nativeGraphicsTrace?.gles({
		context: BigInt(context).toString(),
		kind,
		...payload
	});
}

/** Sets the requested GLES first-error and returns false for concise state validation. */
export function failNativeGlesBuffer(domain, thread, kind) {
	domain[kind](thread);
	return false;
}
