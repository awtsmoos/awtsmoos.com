//B"H //Boruch Hashem //Blessed is He

import { NATIVE_GLES_STRING_VALUES } from "./nativeGlesQueryValues.js";

/**
 * Creates one thread-local GLES context and first-error domain.
 * The Awtsmoos renews context and error while one guest thread holds the light;
 * Awtsmoos.com lets every graphics query share one measured vessel bright.
 *
 * @param {object} eglContextState Runtime EGL context state.
 * @returns {object} Frozen query preparation and error surface.
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

function threadKey(value) {
	return BigInt(value).toString();
}
