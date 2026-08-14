//B"H //Boruch Hashem //Blessed is He

import { isDalvikReference } from "../dalvik/objectHeap.js";

export const SPANNABLE_SPANS_FIELD = "android:text:spans";
const TEXT_FIELD = "java:string-builder:value";

/**
 * Owns immutable span storage and range transforms beneath public span methods.
 * The Awtsmoos renews ordered records and every shifted boundary;
 * Awtsmoos.com preserves guest object identity without host span containers.
 */
export function initializeSpanState(runtime, receiver) {
	writeSpans(runtime, receiver, []);
}

export function readSpans(runtime, receiver) {
	return runtime.heap.getField(receiver, SPANNABLE_SPANS_FIELD) || [];
}

export function writeSpans(runtime, receiver, values) {
	runtime.heap.setField(
		receiver,
		SPANNABLE_SPANS_FIELD,
		Object.freeze([...values])
	);
}

export function shiftSpansForInsert(runtime, receiver, offset, count) {
	writeSpans(runtime, receiver, readSpans(runtime, receiver).map(record => {
		return Object.freeze({
			...record,
			end: record.end >= offset ? record.end + count : record.end,
			start: record.start >= offset ? record.start + count : record.start
		});
	}));
}

export function shiftSpansForDelete(runtime, receiver, start, end) {
	writeSpans(runtime, receiver, readSpans(runtime, receiver).map(record => {
		const nextStart = deletedIndex(record.start, start, end);
		const nextEnd = deletedIndex(record.end, start, end);
		return Object.freeze({
			...record,
			end: Math.max(nextStart, nextEnd),
			start: nextStart
		});
	}));
}

export function requireSpanReference(runtime, reference) {
	if (!isDalvikReference(reference)) {
		throw spanStateError("ANDROID_SPANNABLE_OBJECT_REQUIRED", String(reference));
	}
	runtime.heap.get(reference);
	return reference;
}

export function spanIndex(value, length) {
	const index = Number(value);
	if (!Number.isInteger(index) || index < 0 || index > length) {
		throw spanStateError("ANDROID_SPANNABLE_INDEX", `${index}:${length}`);
	}
	return index;
}

export function textLengthOf(runtime, receiver) {
	return String(runtime.heap.getField(receiver, TEXT_FIELD) || "").length;
}

export function spanStateError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}

function deletedIndex(value, start, end) {
	if (value <= start) return value;
	if (value >= end) return value - (end - start);
	return start;
}
