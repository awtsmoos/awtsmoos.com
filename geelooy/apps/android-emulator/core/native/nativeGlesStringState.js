//B"H
//Boruch Hashem
//Blessed is He

import { queryNativeGlesIndexedString } from "./nativeGlesIndexedStringQuery.js";
import { findNativeGlesInternalFormatValue } from "./nativeGlesInternalFormatValues.js";
import { getNativeGlesQueryDomain } from "./nativeGlesQueryDomain.js";
import { findNativeGlesIntegerValues, findNativeGlesStringValue } from "./nativeGlesQueryValues.js";
import { findNativeGlesShaderPrecisionValue } from "./nativeGlesShaderPrecisionValues.js";
import { createNativeGlesStringPointers } from "./nativeGlesStringPointers.js";
export { NATIVE_GLES_STRING_VALUES } from "./nativeGlesQueryValues.js";

const STATES = new WeakMap();

/**
 * Creates one guest GLES query state over the shared context and error domain.
 * The Awtsmoos renews string, vector, format, and precision in united light;
 * Awtsmoos.com lets every typed get road meet one numeric vessel bright.
 */
export function createNativeGlesStringState(runtimeState, eglContextState) {
	const domain = getNativeGlesQueryDomain(eglContextState);
	const pointers = createNativeGlesStringPointers(runtimeState.nativeHeap);
	return Object.freeze({
		queryIndexedString(name, index, thread) {
			return queryNativeGlesIndexedString(domain, pointers, name, index, thread);
		},
		queryInteger(pnameValue, threadValue) {
			const pname = Number(pnameValue);
			const query = domain.prepare(threadValue);
			const found = findNativeGlesIntegerValues(pname);
			if (!query.valid || !found.supported) {
				if (query.valid) domain.invalidEnum(query.thread);
				return integerOutcome(query.context, pname, false, []);
			}
			return integerOutcome(query.context, pname, true, found.values);
		},
		queryInternalFormat(targetValue, formatValue, pnameValue, bufSizeValue, threadValue) {
			const query = domain.prepare(threadValue);
			const found = findNativeGlesInternalFormatValue(targetValue, formatValue, pnameValue, bufSizeValue);
			if (!query.valid || !found.supported) {
				if (query.valid) {
					found.error === "invalid-value"
						? domain.invalidValue(query.thread)
						: domain.invalidEnum(query.thread);
				}
				return internalOutcome(query.context, found, false);
			}
			return internalOutcome(query.context, found, true);
		},
		queryShaderPrecision(shaderTypeValue, precisionTypeValue, threadValue) {
			const shaderType = Number(shaderTypeValue);
			const precisionType = Number(precisionTypeValue);
			const query = domain.prepare(threadValue);
			const found = findNativeGlesShaderPrecisionValue(shaderType, precisionType);
			if (!query.valid || !found.supported) {
				if (query.valid) domain.invalidEnum(query.thread);
				return precisionOutcome(query.context, found, false);
			}
			return precisionOutcome(query.context, found, true);
		},
		queryString(nameValue, threadValue) {
			const name = Number(nameValue);
			const query = domain.prepare(threadValue);
			const found = findNativeGlesStringValue(name);
			if (!query.valid || !found.supported) {
				if (query.valid) domain.invalidEnum(query.thread);
				return Object.freeze({ context: query.context, name, result: 0n, success: false });
			}
			return Object.freeze({
				context: query.context,
				name,
				result: pointers.pointerFor(name, found.value),
				success: true
			});
		},
		takeError: domain.takeError,
		snapshot() {
			return Object.freeze({ errors: domain.snapshot(), pointers: pointers.snapshot() });
		}
	});
}

export function getNativeGlesStringState(runtimeState, eglContextState) {
	if (!STATES.has(runtimeState)) {
		STATES.set(runtimeState, createNativeGlesStringState(runtimeState, eglContextState));
	}
	return STATES.get(runtimeState);
}

function integerOutcome(context, pname, success, sourceValues) {
	const values = Object.freeze([...sourceValues]);
	return Object.freeze({ context, pname, success, value: values[0] ?? 0, values });
}

function internalOutcome(context, found, success) {
	return Object.freeze({ ...found, context, success });
}

function precisionOutcome(context, found, success) {
	return Object.freeze({
		context,
		precision: success ? found.precision : 0,
		precisionType: found.precisionType,
		range: Object.freeze(success ? [...found.range] : [0, 0]),
		shaderType: found.shaderType,
		success
	});
}
