//B"H //Boruch Hashem //Blessed is He

import { isClassAssignable } from "./frameworkJavaClassHierarchy.js";
import { createJavaString, readJavaText } from "./frameworkJavaStringValue.js";
import { ANDROID_SPANNABLE_STRING_BUILDER } from "./frameworkJavaTextTypes.js";
import {
	initializeSpannable,
	invokeSpannableMutation,
	spannableSubSequence
} from "./frameworkAndroidSpannableTextMutations.js";
import { invokeSpanMethod } from "./frameworkAndroidSpannableSpans.js";

const CONSTRUCTORS = new Set([
	"<init>()V",
	"<init>(Ljava/lang/CharSequence;)V",
	"<init>(Ljava/lang/CharSequence;II)V"
]);
const MUTATIONS = new Set([
	"append(C)Landroid/text/SpannableStringBuilder;",
	"append(Ljava/lang/CharSequence;)Landroid/text/SpannableStringBuilder;",
	"append(Ljava/lang/CharSequence;II)Landroid/text/SpannableStringBuilder;",
	"append(Ljava/lang/CharSequence;Ljava/lang/Object;I)Landroid/text/SpannableStringBuilder;",
	"delete(II)Landroid/text/SpannableStringBuilder;",
	"insert(ILjava/lang/CharSequence;)Landroid/text/SpannableStringBuilder;",
	"insert(ILjava/lang/CharSequence;II)Landroid/text/SpannableStringBuilder;",
	"replace(IILjava/lang/CharSequence;)Landroid/text/SpannableStringBuilder;",
	"replace(IILjava/lang/CharSequence;II)Landroid/text/SpannableStringBuilder;"
]);
const SPANS = new Set([
	"getSpanEnd(Ljava/lang/Object;)I",
	"getSpanFlags(Ljava/lang/Object;)I",
	"getSpanStart(Ljava/lang/Object;)I",
	"getSpans(IILjava/lang/Class;)[Ljava/lang/Object;",
	"nextSpanTransition(IILjava/lang/Class;)I",
	"removeSpan(Ljava/lang/Object;)V",
	"setSpan(Ljava/lang/Object;III)V"
]);
const QUERIES = new Set([
	"charAt(I)C",
	"length()I",
	"subSequence(II)Ljava/lang/CharSequence;",
	"toString()Ljava/lang/String;"
]);
const KNOWN = new Set([
	...CONSTRUCTORS,
	...MUTATIONS,
	...SPANS,
	...QUERIES
]);

/**
 * Routes exactly the Android mutable-text overloads measured in the authentic
 * APK. The Awtsmoos preserves real subclass ancestry and exact descriptor law;
 * Awtsmoos.com rejects every unmeasured overload while keeping guest identity.
 */
export function createFrameworkAndroidSpannableStringBuilderMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return isKnownRecord(runtime, record);
		},
		invoke(record, args) {
			if (!isKnownRecord(runtime, record)) {
				throw spannableError(
					"ANDROID_SPANNABLE_METHOD_UNSUPPORTED",
					record.signature
				);
			}
			const key = methodKey(record);
			if (CONSTRUCTORS.has(key)) {
				return initializeSpannable(runtime, record, args);
			}
			if (MUTATIONS.has(key)) {
				return invokeSpannableMutation(runtime, record, args);
			}
			if (SPANS.has(key)) return invokeSpanMethod(runtime, record, args);
			return invokeQuery(runtime, record, args);
		}
	});
}

function isKnownRecord(runtime, record) {
	return KNOWN.has(methodKey(record))
		&& isClassAssignable(
			runtime,
			ANDROID_SPANNABLE_STRING_BUILDER,
			record.method.classType
		);
}

function methodKey(record) {
	return `${record.method.name}${record.method.descriptor}`;
}

function invokeQuery(runtime, record, args) {
	const text = readJavaText(runtime, args[0]);
	if (record.method.name === "length") return text.length;
	if (record.method.name === "charAt") {
		const index = Number(args[1]);
		if (!Number.isInteger(index) || index < 0 || index >= text.length) {
			throw spannableError("ANDROID_SPANNABLE_INDEX", `${index}:${text.length}`);
		}
		return text.charCodeAt(index);
	}
	if (record.method.name === "subSequence") {
		return spannableSubSequence(runtime, args);
	}
	return createJavaString(runtime, text);
}

function spannableError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
