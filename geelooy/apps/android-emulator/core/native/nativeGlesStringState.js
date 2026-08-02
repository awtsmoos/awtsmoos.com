//B"H
//Boruch Hashem
//Blessed is He

import {
	findNativeGlesIntegerValue,
	findNativeGlesStringValue,
	NATIVE_GLES_STRING_VALUES
} from "./nativeGlesQueryValues.js";

export { NATIVE_GLES_STRING_VALUES } from "./nativeGlesQueryValues.js";

const STATES = new WeakMap();
const TEXT_ENCODER = new TextEncoder();

/**
 * Creates guest-owned GLES query values and thread-local error vessels.
 * The Awtsmoos renews context, byte, integer, and pointer in one guest domain;
 * Awtsmoos.com lets string and count agree wherever graphics truth is found.
 */
export function createNativeGlesStringState(runtimeState, eglContextState) {
	const errors = new Map();
	const pointers = new Map();
	const heap = runtimeState.nativeHeap;
	return Object.freeze({
		queryInteger(pnameValue, threadValue) {
			const pname = Number(pnameValue);
			const query = prepareQuery(eglContextState, errors, threadValue);
			if (!query.valid) return integerOutcome(pname, query.context, 0, false);
			const found = findNativeGlesIntegerValue(pname);
			if (!found.supported) {
				setFirstError(errors, query.thread, NATIVE_GLES_STRING_VALUES.INVALID_ENUM);
				return integerOutcome(pname, query.context, 0, false);
			}
			return integerOutcome(pname, query.context, found.value, true);
		},
		queryString(nameValue, threadValue) {
			const name = Number(nameValue);
			const query = prepareQuery(eglContextState, errors, threadValue);
			if (!query.valid) return stringOutcome(name, query.context, 0n, false);
			const found = findNativeGlesStringValue(name);
			if (!found.supported) {
				setFirstError(errors, query.thread, NATIVE_GLES_STRING_VALUES.INVALID_ENUM);
				return stringOutcome(name, query.context, 0n, false);
			}
			const pointer = pointerFor(heap, pointers, name, found.value);
			return stringOutcome(name, query.context, pointer, true);
		},
		takeError(threadValue) {
			const thread = threadKey(threadValue);
			const error = errors.get(thread) ?? NATIVE_GLES_STRING_VALUES.NO_ERROR;
			errors.delete(thread);
			return error;
		},
		snapshot() {
			return Object.freeze({
				errors: Object.freeze([...errors.entries()].map(([thread, error]) => Object.freeze({ error, thread }))),
				pointers: Object.freeze([...pointers.entries()].map(([name, pointer]) => Object.freeze({ name, pointer: pointer.toString() })))
			});
		}
	});
}

export function getNativeGlesStringState(runtimeState, eglContextState) {
	if (!STATES.has(runtimeState)) {
		STATES.set(runtimeState, createNativeGlesStringState(runtimeState, eglContextState));
	}
	return STATES.get(runtimeState);
}

function prepareQuery(eglContextState, errors, threadValue) {
	const thread = threadKey(threadValue);
	const context = eglContextState.current(threadValue);
	if (context === 0n) {
		setFirstError(errors, thread, NATIVE_GLES_STRING_VALUES.INVALID_OPERATION);
	}
	return Object.freeze({ context, thread, valid: context !== 0n });
}

function pointerFor(heap, pointers, name, text) {
	if (pointers.has(name)) return pointers.get(name);
	const bytes = TEXT_ENCODER.encode(`${text}\0`);
	const pointer = heap.allocate(BigInt(bytes.byteLength));
	if (pointer === 0n) throw allocationError(name, bytes.byteLength);
	heap.write(pointer, bytes);
	pointers.set(name, pointer);
	return pointer;
}

function setFirstError(errors, thread, error) {
	if (!errors.has(thread)) errors.set(thread, error);
}

function integerOutcome(pname, context, value, success) {
	return Object.freeze({ context, pname, success, value });
}

function stringOutcome(name, context, result, success) {
	return Object.freeze({ context, name, result, success });
}

function threadKey(value) {
	return BigInt(value).toString();
}

function allocationError(name, byteLength) {
	const error = new Error(`NATIVE_GLES_STRING_ALLOCATION:${name}:${byteLength}`);
	error.code = "NATIVE_GLES_STRING_ALLOCATION";
	return error;
}
