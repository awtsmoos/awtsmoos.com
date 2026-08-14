//B"H //Boruch Hashem //Blessed is He

import {
	createJavaString,
	readJavaText,
	writeJavaText
} from "./frameworkJavaStringValue.js";
import {
	deleteSpannable,
	insertSpannable,
	replaceSpannable,
	textRange
} from "./frameworkAndroidSpannableRanges.js";
import {
	initializeSpanState,
	shiftSpansForInsert
} from "./frameworkAndroidSpannableSpanState.js";
import { invokeSpanMethod } from "./frameworkAndroidSpannableSpans.js";

/**
 * Owns Spannable constructors, append, and mutation routing. The Awtsmoos
 * renews mutable characters, fluent identity, and append-created span records;
 * Awtsmoos.com delegates range law to a separate measured vessel.
 */
export function initializeSpannable(runtime, record, args) {
	const receiver = args[0];
	const descriptor = record.method.descriptor;
	let text = "";
	if (descriptor === "(Ljava/lang/CharSequence;)V") {
		text = readJavaText(runtime, args[1]);
	} else if (descriptor === "(Ljava/lang/CharSequence;II)V") {
		text = textRange(readJavaText(runtime, args[1]), args[2], args[3]);
	}
	writeJavaText(runtime, receiver, text);
	initializeSpanState(runtime, receiver);
	return 0;
}

export function invokeSpannableMutation(runtime, record, args) {
	if (record.method.name === "append") return append(runtime, record, args);
	if (record.method.name === "insert") return insertSpannable(runtime, record, args);
	if (record.method.name === "replace") return replaceSpannable(runtime, record, args);
	if (record.method.name === "delete") return deleteSpannable(runtime, args);
	throw mutationError("ANDROID_SPANNABLE_MUTATION_UNSUPPORTED", record.signature);
}

export function spannableSubSequence(runtime, args) {
	const text = readJavaText(runtime, args[0]);
	return createJavaString(runtime, textRange(text, args[1], args[2]));
}

function append(runtime, record, args) {
	const receiver = args[0];
	const before = readJavaText(runtime, receiver);
	const addition = appendText(runtime, record, args);
	writeJavaText(runtime, receiver, before + addition);
	shiftSpansForInsert(runtime, receiver, before.length, addition.length);
	if (record.method.descriptor.includes("Ljava/lang/Object;I)")) {
		invokeSpanMethod(runtime, spanRecord(), [
			receiver,
			args[2],
			before.length,
			before.length + addition.length,
			args[3]
		]);
	}
	return receiver;
}

function appendText(runtime, record, args) {
	if (record.method.descriptor.startsWith("(C)")) {
		return String.fromCharCode(Number(args[1]) & 0xffff);
	}
	if (record.method.descriptor.startsWith("(Ljava/lang/CharSequence;II")) {
		return textRange(readJavaText(runtime, args[1]), args[2], args[3]);
	}
	return args[1] === 0 ? "null" : readJavaText(runtime, args[1]);
}

function spanRecord() {
	return {
		method: { name: "setSpan" },
		signature: "Landroid/text/SpannableStringBuilder;->setSpan"
	};
}

function mutationError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
