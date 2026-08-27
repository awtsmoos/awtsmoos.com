//B"H //Boruch Hashem //Blessed is He

import { isClassAssignable } from "./frameworkJavaClassHierarchy.js";
import { requireClassDescriptor } from "./frameworkJavaClassValues.js";
import { createGuestArray } from "./frameworkJavaStringValue.js";
import {
	readSpans,
	requireSpanReference,
	spanIndex,
	spanStateError,
	textLengthOf,
	writeSpans
} from "./frameworkAndroidSpannableSpanState.js";

const OBJECT_ARRAY = "[Ljava/lang/Object;";

/**
 * Routes public span methods over immutable guest records. The Awtsmoos renews
 * object, range, flags, class filters, and transition boundaries;
 * Awtsmoos.com returns guest arrays and never a host Android span container.
 */
export function invokeSpanMethod(runtime, record, args) {
	const name = record.method.name;
	if (name === "setSpan") return setSpan(runtime, args);
	if (name === "removeSpan") return removeSpan(runtime, args);
	if (name === "getSpanStart") return property(runtime, args, "start", -1);
	if (name === "getSpanEnd") return property(runtime, args, "end", -1);
	if (name === "getSpanFlags") return property(runtime, args, "flags", 0);
	if (name === "getSpans") return getSpans(runtime, args);
	if (name === "nextSpanTransition") return nextTransition(runtime, args);
	throw spanStateError("ANDROID_SPANNABLE_SPAN_METHOD_UNSUPPORTED", record.signature);
}

function setSpan(runtime, args) {
	const receiver = args[0];
	const object = requireSpanReference(runtime, args[1]);
	const length = textLengthOf(runtime, receiver);
	const start = spanIndex(args[2], length);
	const end = spanIndex(args[3], length);
	if (end < start) {
		throw spanStateError("ANDROID_SPANNABLE_RANGE", `${start}:${end}`);
	}
	const records = readSpans(runtime, receiver).filter(item => item.object !== object);
	records.push(Object.freeze({
		end,
		flags: Number(args[4]) | 0,
		object,
		start
	}));
	writeSpans(runtime, receiver, records);
	return 0;
}

function removeSpan(runtime, args) {
	const object = requireSpanReference(runtime, args[1]);
	writeSpans(
		runtime,
		args[0],
		readSpans(runtime, args[0]).filter(item => item.object !== object)
	);
	return 0;
}

function property(runtime, args, key, fallback) {
	const item = readSpans(runtime, args[0]).find(record => record.object === args[1]);
	return item ? item[key] : fallback;
}

function getSpans(runtime, args) {
	const length = textLengthOf(runtime, args[0]);
	const start = spanIndex(args[1], length);
	const end = spanIndex(args[2], length);
	const requested = requireClassDescriptor(args[3]);
	const values = readSpans(runtime, args[0])
		.filter(item => overlaps(item, start, end))
		.filter(item => isClassAssignable(
			runtime,
			requested,
			runtime.heap.get(item.object).type
		))
		.map(item => item.object);
	return createGuestArray(runtime, OBJECT_ARRAY, values);
}

function nextTransition(runtime, args) {
	const length = textLengthOf(runtime, args[0]);
	const start = spanIndex(args[1], length);
	let limit = spanIndex(args[2], length);
	const requested = requireClassDescriptor(args[3]);
	for (const item of readSpans(runtime, args[0])) {
		if (!isClassAssignable(runtime, requested, runtime.heap.get(item.object).type)) {
			continue;
		}
		for (const boundary of [item.start, item.end]) {
			if (boundary > start && boundary < limit) limit = boundary;
		}
	}
	return limit;
}

function overlaps(record, start, end) {
	if (start === end) return record.start <= start && record.end >= end;
	return record.start < end && record.end > start;
}
