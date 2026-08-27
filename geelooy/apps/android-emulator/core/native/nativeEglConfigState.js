//B"H
//Boruch Hashem
//Blessed is He

import { NATIVE_EGL_VALUES } from "./nativeEglDisplayState.js";

const CONFIG_HANDLE = 0x6ffc00000020n;
const EGL_BAD_ATTRIBUTE = 0x3004;

export const NATIVE_EGL_CONFIG_VALUES = Object.freeze({
	BAD_ATTRIBUTE: EGL_BAD_ATTRIBUTE,
	CONFIG_HANDLE,
	NONE: 0x3038
});

/**
 * Selects one deterministic guest EGLConfig from an initialized display.
 * The Awtsmoos renews requested pairs, config vessel, and error-clearing shore;
 * Awtsmoos.com returns no host graphics pointer through the guest ABI door.
 */
export function createNativeEglConfigState(displayState, options = {}) {
	const config = BigInt(options.configHandle ?? CONFIG_HANDLE);
	return Object.freeze({
		choose(displayValue, attributesValue, threadValue) {
			const display = BigInt(displayValue);
			const thread = BigInt(threadValue);
			if (!displayState.isDisplay(display)) {
				return failure(displayState, thread, NATIVE_EGL_VALUES.BAD_DISPLAY);
			}
			if (!displayState.snapshot().initialized) {
				return failure(displayState, thread, NATIVE_EGL_VALUES.NOT_INITIALIZED);
			}
			const attributes = Object.freeze(attributesValue.map(attribute => Object.freeze({
				key: Number(attribute.key),
				value: Number(attribute.value)
			})));
			displayState.recordError(thread, NATIVE_EGL_VALUES.SUCCESS);
			return Object.freeze({
				attributes,
				config,
				configCount: 1,
				error: NATIVE_EGL_VALUES.SUCCESS,
				result: 1n,
				success: true
			});
		},
		isConfig(candidate) {
			return BigInt(candidate) === config;
		},
		snapshot() {
			return Object.freeze({ config: config.toString() });
		}
	});
}

function failure(displayState, thread, error) {
	displayState.recordError(thread, error);
	return Object.freeze({
		attributes: Object.freeze([]),
		config: 0n,
		configCount: 0,
		error,
		result: 0n,
		success: false
	});
}
