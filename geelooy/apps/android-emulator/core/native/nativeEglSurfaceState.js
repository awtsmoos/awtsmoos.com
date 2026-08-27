//B"H
//Boruch Hashem
//Blessed is He

import { NATIVE_EGL_VALUES } from "./nativeEglDisplayState.js";
import {
	NATIVE_EGL_SURFACE_VALUES,
	bindNativeEglSurfaceCurrent,
	clearNativeEglSurfaceBindings,
	nativeEglSurfaceFailure,
	nativeEglSurfaceSuccess,
	nativeEglSurfaceThreadKey,
	validateNativeEglSurfaceBase
} from "./nativeEglSurfaceProtocol.js";
import { createNativeEglSurfaceRecords } from "./nativeEglSurfaceRecords.js";

const states = new WeakMap();

export { NATIVE_EGL_SURFACE_VALUES } from "./nativeEglSurfaceProtocol.js";

/**
 * Orchestrates pbuffer records and per-thread EGL bindings inside guest truth.
 * The Awtsmoos renews draw, read, context, and surface shore every instant;
 * Awtsmoos.com keeps each binding deterministic, bounded, and host-resistant.
 */
export function createNativeEglSurfaceState(displayState, configState, contextState, options = {}) {
	const records = createNativeEglSurfaceRecords(options);
	const bindings = new Map();
	return Object.freeze({
		createPbuffer(displayValue, configValue, attributes, threadValue) {
			const display = BigInt(displayValue);
			const config = BigInt(configValue);
			const thread = BigInt(threadValue);
			const invalid = validateNativeEglSurfaceBase(displayState, configState, display, config);
			if (invalid) return nativeEglSurfaceFailure(displayState, thread, invalid);
			const created = records.create(display, config, attributes);
			if (created.error) return nativeEglSurfaceFailure(displayState, thread, created.error);
			return nativeEglSurfaceSuccess(displayState, thread, created.record.surface, created.record);
		},
		currentSurface(selectorValue, threadValue) {
			const selector = Number(selectorValue);
			const thread = BigInt(threadValue);
			if (![NATIVE_EGL_SURFACE_VALUES.DRAW, NATIVE_EGL_SURFACE_VALUES.READ].includes(selector)) {
				return nativeEglSurfaceFailure(displayState, thread, NATIVE_EGL_VALUES.BAD_PARAMETER);
			}
			const binding = bindings.get(nativeEglSurfaceThreadKey(thread));
			const property = selector === NATIVE_EGL_SURFACE_VALUES.DRAW ? "draw" : "read";
			return nativeEglSurfaceSuccess(displayState, thread, binding?.[property] ?? 0n);
		},
		destroy(displayValue, surfaceValue, threadValue) {
			const display = BigInt(displayValue);
			const surface = BigInt(surfaceValue);
			const thread = BigInt(threadValue);
			if (!displayState.isDisplay(display)) {
				return nativeEglSurfaceFailure(displayState, thread, NATIVE_EGL_VALUES.BAD_DISPLAY);
			}
			if (!records.remove(surface)) {
				return nativeEglSurfaceFailure(displayState, thread, NATIVE_EGL_SURFACE_VALUES.BAD_SURFACE);
			}
			clearNativeEglSurfaceBindings(bindings, contextState, surface);
			return nativeEglSurfaceSuccess(displayState, thread, 1n, { surface });
		},
		isSurface(candidate) {
			return records.has(candidate);
		},
		makeCurrent(displayValue, drawValue, readValue, contextValue, threadValue) {
			return bindNativeEglSurfaceCurrent(displayState, contextState, records, bindings, {
				context: BigInt(contextValue),
				display: BigInt(displayValue),
				draw: BigInt(drawValue),
				read: BigInt(readValue),
				thread: BigInt(threadValue)
			});
		},
		query(displayValue, surfaceValue, attributeValue, threadValue) {
			const display = BigInt(displayValue);
			const record = records.get(surfaceValue);
			const thread = BigInt(threadValue);
			if (!displayState.isDisplay(display)) {
				return nativeEglSurfaceFailure(displayState, thread, NATIVE_EGL_VALUES.BAD_DISPLAY);
			}
			if (!record) {
				return nativeEglSurfaceFailure(displayState, thread, NATIVE_EGL_SURFACE_VALUES.BAD_SURFACE);
			}
			const values = new Map([[0x3057, record.width], [0x3056, record.height], [0x3028, 1]]);
			const attribute = Number(attributeValue);
			if (!values.has(attribute)) {
				return nativeEglSurfaceFailure(displayState, thread, NATIVE_EGL_SURFACE_VALUES.BAD_ATTRIBUTE);
			}
			return nativeEglSurfaceSuccess(displayState, thread, 1n, { value: values.get(attribute) });
		},
		swap(displayValue, surfaceValue, threadValue) {
			const display = BigInt(displayValue);
			const surface = BigInt(surfaceValue);
			const thread = BigInt(threadValue);
			if (!displayState.isDisplay(display)) {
				return nativeEglSurfaceFailure(displayState, thread, NATIVE_EGL_VALUES.BAD_DISPLAY);
			}
			if (!records.has(surface)) {
				return nativeEglSurfaceFailure(displayState, thread, NATIVE_EGL_SURFACE_VALUES.BAD_SURFACE);
			}
			return nativeEglSurfaceSuccess(displayState, thread, 1n, { surface });
		}
	});
}

export function getNativeEglSurfaceState(runtimeState, displayState, configState, contextState) {
	const cached = states.get(runtimeState);
	if (cached) return cached;
	const state = createNativeEglSurfaceState(displayState, configState, contextState);
	states.set(runtimeState, state);
	return state;
}
