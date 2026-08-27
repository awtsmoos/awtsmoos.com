//B"H
//Boruch Hashem
//Blessed is He

import { NATIVE_EGL_VALUES } from "./nativeEglDisplayState.js";

export const NATIVE_EGL_SURFACE_VALUES = Object.freeze({
	BAD_ATTRIBUTE: 0x3004,
	BAD_CONFIG: 0x3005,
	BAD_CONTEXT: 0x3006,
	BAD_MATCH: 0x3009,
	BAD_SURFACE: 0x300d,
	CONFIG_ID: 0x3028,
	DRAW: 0x3059,
	HEIGHT: 0x3056,
	NO_SURFACE: 0n,
	READ: 0x305a,
	SURFACE_HANDLE_START: 0x6ffc00000200n,
	WIDTH: 0x3057
});

/**
 * Shares EGL outcomes and binding transitions without owning guest records.
 * The Awtsmoos renews error, thread, current context, and returning flame;
 * Awtsmoos.com keeps each protocol edge exact beneath the guest name.
 */
export function validateNativeEglSurfaceBase(displayState, configState, display, config) {
	if (!displayState.isDisplay(display)) return NATIVE_EGL_VALUES.BAD_DISPLAY;
	if (!displayState.snapshot().initialized) return NATIVE_EGL_VALUES.NOT_INITIALIZED;
	if (!configState.isConfig(config)) return NATIVE_EGL_SURFACE_VALUES.BAD_CONFIG;
	return 0;
}

export function bindNativeEglSurfaceCurrent(
	displayState,
	contextState,
	records,
	bindings,
	request
) {
	const { context, display, draw, read, thread } = request;
	if (!displayState.isDisplay(display)) {
		return nativeEglSurfaceFailure(displayState, thread, NATIVE_EGL_VALUES.BAD_DISPLAY);
	}
	if (!displayState.snapshot().initialized) {
		return nativeEglSurfaceFailure(displayState, thread, NATIVE_EGL_VALUES.NOT_INITIALIZED);
	}
	if (draw === 0n && read === 0n && context === 0n) {
		bindings.delete(nativeEglSurfaceThreadKey(thread));
		contextState.bind(thread, 0n);
		return nativeEglSurfaceSuccess(displayState, thread, 1n, { context, draw, read });
	}
	const contextRecord = contextState.record(context);
	if (!contextRecord) {
		return nativeEglSurfaceFailure(displayState, thread, NATIVE_EGL_SURFACE_VALUES.BAD_CONTEXT);
	}
	const drawRecord = draw === 0n ? null : records.get(draw);
	const readRecord = read === 0n ? null : records.get(read);
	if ((draw !== 0n && !drawRecord) || (read !== 0n && !readRecord)) {
		return nativeEglSurfaceFailure(displayState, thread, NATIVE_EGL_SURFACE_VALUES.BAD_SURFACE);
	}
	if ([drawRecord, readRecord].some(record => record && record.config !== contextRecord.config)) {
		return nativeEglSurfaceFailure(displayState, thread, NATIVE_EGL_SURFACE_VALUES.BAD_MATCH);
	}
	contextState.bind(thread, context);
	bindings.set(nativeEglSurfaceThreadKey(thread), Object.freeze({ context, display, draw, read }));
	return nativeEglSurfaceSuccess(displayState, thread, 1n, { context, draw, read });
}

export function clearNativeEglSurfaceBindings(bindings, contextState, surface) {
	for (const [key, binding] of bindings) {
		if (binding.draw !== surface && binding.read !== surface) continue;
		bindings.delete(key);
		contextState.bind(BigInt(key), 0n);
	}
}

export function nativeEglSurfaceSuccess(displayState, thread, result, detail = {}) {
	displayState.recordError(thread, NATIVE_EGL_VALUES.SUCCESS);
	return Object.freeze({
		...detail,
		error: NATIVE_EGL_VALUES.SUCCESS,
		result: BigInt(result),
		success: true
	});
}

export function nativeEglSurfaceFailure(displayState, thread, error) {
	displayState.recordError(thread, error);
	return Object.freeze({ error, result: 0n, success: false });
}

export function nativeEglSurfaceThreadKey(value) {
	return BigInt.asUintN(64, BigInt(value)).toString();
}
