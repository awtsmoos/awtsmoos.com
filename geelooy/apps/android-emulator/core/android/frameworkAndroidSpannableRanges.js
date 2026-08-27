//B"H //Boruch Hashem //Blessed is He

import {
	boundedStringIndex,
	readJavaText,
	writeJavaText
} from "./frameworkJavaStringValue.js";
import {
	shiftSpansForDelete,
	shiftSpansForInsert
} from "./frameworkAndroidSpannableSpanState.js";

const RANGED_INSERT =
	"(ILjava/lang/CharSequence;II)Landroid/text/SpannableStringBuilder;";
const RANGED_REPLACE =
	"(IILjava/lang/CharSequence;II)Landroid/text/SpannableStringBuilder;";

/**
 * Applies exact authentic insert, replace, and delete overloads to mutable text.
 * The Awtsmoos renews characters and span boundaries through descriptor law;
 * Awtsmoos.com rejects heuristic overload guesses and preserves receiver identity.
 */
export function insertSpannable(runtime, record, args) {
	const receiver = args[0];
	const before = readJavaText(runtime, receiver);
	const offset = boundedStringIndex(args[1], before.length, true);
	const source = readJavaText(runtime, args[2]);
	const addition = record.method.descriptor === RANGED_INSERT
		? textRange(source, args[3], args[4])
		: source;
	writeJavaText(
		runtime,
		receiver,
		before.slice(0, offset) + addition + before.slice(offset)
	);
	shiftSpansForInsert(runtime, receiver, offset, addition.length);
	return receiver;
}

export function replaceSpannable(runtime, record, args) {
	const receiver = args[0];
	const before = readJavaText(runtime, receiver);
	const [start, end] = mutableRange(before, args[1], args[2]);
	const source = readJavaText(runtime, args[3]);
	const addition = record.method.descriptor === RANGED_REPLACE
		? textRange(source, args[4], args[5])
		: source;
	writeJavaText(
		runtime,
		receiver,
		before.slice(0, start) + addition + before.slice(end)
	);
	shiftSpansForDelete(runtime, receiver, start, end);
	shiftSpansForInsert(runtime, receiver, start, addition.length);
	return receiver;
}

export function deleteSpannable(runtime, args) {
	const receiver = args[0];
	const before = readJavaText(runtime, receiver);
	const [start, end] = mutableRange(before, args[1], args[2]);
	writeJavaText(runtime, receiver, before.slice(0, start) + before.slice(end));
	shiftSpansForDelete(runtime, receiver, start, end);
	return receiver;
}

export function textRange(text, startValue, endValue) {
	const [start, end] = mutableRange(text, startValue, endValue);
	return text.slice(start, end);
}

function mutableRange(text, startValue, endValue) {
	const start = boundedStringIndex(startValue, text.length, true);
	const end = boundedStringIndex(endValue, text.length, true);
	if (end < start) {
		throw rangeError("ANDROID_SPANNABLE_RANGE", `${start}:${end}`);
	}
	return [start, end];
}

function rangeError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
