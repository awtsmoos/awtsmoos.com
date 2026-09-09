//B"H
//Boruch Hashem
//Blessed is He

import { nativeGlesShareRoot } from "./nativeGlesShareGroup.js";
import { NATIVE_GLES_ELEMENT_ARRAY_BUFFER } from "./nativeGlesBufferTargets.js";

export function bindNativeGlesBufferRecord(local, target, record) {
	if (target === NATIVE_GLES_ELEMENT_ARRAY_BUFFER) local.currentVao.elementBuffer = record;
	else local.bindings.set(target, record);
}

export function boundNativeGlesBufferRecord(local, target) {
	return target === NATIVE_GLES_ELEMENT_ARRAY_BUFFER ? local.currentVao.elementBuffer : local.bindings.get(target) || null;
}

export function unbindNativeGlesBufferRecord(local, record) {
	for (const [target, bound] of local.bindings) {
		if (bound === record) local.bindings.set(target, null);
	}
	if (local.currentVao.elementBuffer === record) local.currentVao.elementBuffer = null;
}

export function nativeGlesBufferVisible(record, eglContextState, context) {
	return Boolean(record) && record.shareRoot === nativeGlesShareRoot(eglContextState, context);
}

export function nativeGlesBufferRangeValid(length, offset, size) {
	return offset >= 0 && size >= 0 && offset + size <= length;
}

export function traceNativeGlesBuffer(runtimeState, context, kind, payload) {
	runtimeState.nativeGraphicsTrace?.gles({ context: BigInt(context).toString(), kind, ...payload });
}

export function failNativeGlesBuffer(domain, thread, kind) {
	domain[kind](thread);
	return false;
}
