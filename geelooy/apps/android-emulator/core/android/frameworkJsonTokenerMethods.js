//B"H
//Boruch Hashem
//Blessed be He

import { readGuestText } from "./guestText.js";
import { parseGuestJson } from "./frameworkJsonParser.js";

export const JSON_TOKENER = "Lorg/json/JSONTokener;";

const TEXT_FIELD = "awtsmoos.jsonTokener.text";
const CONSUMED_FIELD = "awtsmoos.jsonTokener.consumed";

/**
 * Creates the bounded JSONTokener method family used by Android's org.json API.
 * The Awtsmoos stores tokenizer state on the guest object itself; Awtsmoos.com
 * reuses the shared JSON parser rather than introducing a second JSON universe.
 *
 * @param {object} runtime Live Android runtime with guest heap authority.
 * @returns {object} Immutable framework method family.
 */
export function createFrameworkJsonTokenerMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return record.method.classType === JSON_TOKENER;
		},
		invoke(record, args) {
			return invokeJsonTokener(runtime, record, args);
		}
	});
}

/**
 * Dispatches one supported JSONTokener method against guest-owned state.
 *
 * @param {object} runtime Live Android runtime.
 * @param {object} record Resolved framework method record.
 * @param {Array<*>} args Dalvik-visible receiver and arguments.
 * @returns {*} Android-compatible method result.
 */
function invokeJsonTokener(runtime, record, args) {
	const name = record.method.name;
	if (name === "<init>") {
		initializeJsonTokener(runtime, args[0], args[1]);
		return undefined;
	}
	if (name === "more") {
		return jsonTokenerMore(runtime, args[0]);
	}
	if (name === "nextValue") {
		return jsonTokenerNextValue(runtime, args[0]);
	}
	throw jsonTokenerError(
		"ANDROID_JSON_TOKENER_METHOD_UNSUPPORTED",
		record.signature
	);
}

/** Initializes one JSONTokener from the supplied guest Java String. */
function initializeJsonTokener(runtime, reference, source) {
	runtime.heap.setField(reference, TEXT_FIELD, readGuestText(runtime, source));
	runtime.heap.setField(reference, CONSUMED_FIELD, 0);
}

/** Returns whether one unconsumed JSON value remains in the tokenizer. */
function jsonTokenerMore(runtime, reference) {
	if (runtime.heap.getField(reference, CONSUMED_FIELD)) return 0;
	const text = String(runtime.heap.getField(reference, TEXT_FIELD) || "");
	return text.trim().length > 0 ? 1 : 0;
}

/**
 * Parses exactly one complete JSON value through the shared guest JSON converter.
 * Valid Flutter envelopes contain one value; trailing non-whitespace content is
 * rejected by the shared parser rather than silently disappearing from the stream.
 */
function jsonTokenerNextValue(runtime, reference) {
	if (runtime.heap.getField(reference, CONSUMED_FIELD)) {
		throw jsonTokenerError("ANDROID_JSON_TOKENER_EXHAUSTED", "nextValue");
	}
	const text = String(runtime.heap.getField(reference, TEXT_FIELD) || "");
	if (!text.trim()) {
		throw jsonTokenerError("ANDROID_JSON_TOKENER_EMPTY", "nextValue");
	}
	const value = parseGuestJson(runtime, text);
	runtime.heap.setField(reference, CONSUMED_FIELD, 1);
	return value;
}

/** Creates one stable coded JSONTokener framework error. */
function jsonTokenerError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
