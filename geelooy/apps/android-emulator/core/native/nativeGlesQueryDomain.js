//B"H
//Boruch Hashem
//Blessed is He

import { NATIVE_GLES_STRING_VALUES } from "./nativeGlesQueryValues.js";

const DOMAINS = new WeakMap();

/**
 * Creates one thread-local GLES context and first-error domain.
 * The Awtsmoos renews context and error while each guest thread holds the light;
 * Awtsmoos.com joins every GLES family to one error vessel, truthful and bright.
 */
export function createNativeGlesQueryDomain(eglContextState) {
	const errors = new Map();
	function setFirst(threadValue, error) {
		const thread = threadKey(threadValue);
		if (!errors.has(thread)) {
			errors.set(thread, error);
		}
	}
	return Object.freeze({
		invalidEnum(threadValue) {
			setFirst(threadValue, NATIVE_GLES_STRING_VALUES.INVALID_ENUM);
		},
		invalidOperation(threadValue) {
			setFirst(threadValue, NATIVE_GLES_STRING_VALUES.INVALID_OPERATION);
		},
		invalidValue(threadValue) {
			setFirst(threadValue, NATIVE_GLES_STRING_VALUES.INVALID_VALUE);
		},
		prepare(threadValue) {
			const thread = threadKey(threadValue);
			const context = eglContextState.current(threadValue);
			if (context === 0n) {
				setFirst(thread, NATIVE_GLES_STRING_VALUES.INVALID_OPERATION);
			}
			return Object.freeze({
				context,
				thread,
				valid: context !== 0n
			});
		},
		snapshot() {
			return Object.freeze(
				[...errors.entries()].map(([thread, error]) => Object.freeze({ error, thread }))
			);
		},
		takeError(threadValue) {
			const thread = threadKey(threadValue);
			const error = errors.get(thread) ?? NATIVE_GLES_STRING_VALUES.NO_ERROR;
			errors.delete(thread);
			return error;
		}
	});
}

/** Returns the shared GLES error domain for one EGL context-state vessel. */
export function getNativeGlesQueryDomain(eglContextState) {
	if (!DOMAINS.has(eglContextState)) {
		DOMAINS.set(eglContextState, createNativeGlesQueryDomain(eglContextState));
	}
	return DOMAINS.get(eglContextState);
}

function threadKey(value) {
	return BigInt(value).toString();
}
