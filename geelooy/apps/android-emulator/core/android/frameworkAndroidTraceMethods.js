//B"H
//Boruch Hashem
//Blessed be He

import { readJavaLong } from "./frameworkJavaLongValues.js";
import { readGuestText } from "./guestText.js";

export const ANDROID_TRACE_CLASS = "Landroid/os/Trace;";
const TRACE_TAG_APP = 4096n;
const METHODS = Object.freeze([
	method("isEnabled", "()Z"),
	method("isTagEnabled", "(J)Z"),
	method("beginSection", "(Ljava/lang/String;)V"),
	method("endSection", "()V"),
	method("beginAsyncSection", "(Ljava/lang/String;I)V"),
	method("endAsyncSection", "(Ljava/lang/String;I)V"),
	method("setCounter", "(Ljava/lang/String;J)V"),
	method("asyncTraceBegin", "(JLjava/lang/String;I)V"),
	method("asyncTraceEnd", "(JLjava/lang/String;I)V"),
	method("traceBegin", "(JLjava/lang/String;)V"),
	method("traceEnd", "(J)V"),
	method("traceCounter", "(JLjava/lang/String;I)V")
]);

/**
 * Publishes the Android Trace methods visible to guest Java reflection.
 * Metadata is declarative only: no host function is stored in reflected Method
 * objects, and invocation still travels through the Android framework dispatcher.
 *
 * @param {string} descriptor Guest class descriptor being reflected.
 * @returns {readonly object[]} Immutable public static Trace method metadata.
 */
export function frameworkAndroidTraceMethodMetadata(descriptor) {
	return descriptor === ANDROID_TRACE_CLASS ? METHODS : Object.freeze([]);
}

/**
 * Executes Trace queries and legacy tag-based calls without host instrumentation.
 * Android trace calls are observable virtual-device state only; they neither alter
 * guest control flow beyond their Java return value nor trigger host-side tracing.
 *
 * @param {object} runtime Live Android runtime receiving trace testimony.
 * @param {object} record Framework method record selected by Java or reflection.
 * @param {Array<unknown>} args Unboxed Java arguments in descriptor order.
 * @returns {{handled:boolean,value:unknown}} Bounded framework dispatch result.
 */
export function invokeAndroidTraceQuery(runtime, record, args) {
	if (record.method.classType !== ANDROID_TRACE_CLASS) return result(false, 0);
	const name = record.method.name;
	if (name === "isEnabled") return result(true, 1);
	if (name === "isTagEnabled" && record.method.descriptor === "(J)Z") {
		return result(true, readJavaLong(runtime, args[0]) === TRACE_TAG_APP ? 1 : 0);
	}
	if (name === "asyncTraceBegin") return taggedAsync(runtime, args, "async-begin-tagged");
	if (name === "asyncTraceEnd") return taggedAsync(runtime, args, "async-end-tagged");
	if (name === "traceBegin") return taggedNamed(runtime, args, "begin-tagged");
	if (name === "traceEnd") return taggedEnd(runtime, args);
	if (name === "traceCounter") return taggedCounter(runtime, args);
	if (name === "setCounter") return namedCounter(runtime, args);
	return result(false, 0);
}

function taggedAsync(runtime, args, kind) {
	const tag = readJavaLong(runtime, args[0]);
	const name = readGuestText(runtime, args[1]);
	const cookie = Number(args[2]) | 0;
	traceState(runtime).events.push(Object.freeze({ cookie, kind, name, tag: String(tag) }));
	return result(true, undefined);
}

function taggedNamed(runtime, args, kind) {
	const tag = readJavaLong(runtime, args[0]);
	const name = readGuestText(runtime, args[1]);
	traceState(runtime).events.push(Object.freeze({ kind, name, tag: String(tag) }));
	return result(true, undefined);
}

function taggedEnd(runtime, args) {
	const tag = readJavaLong(runtime, args[0]);
	traceState(runtime).events.push(Object.freeze({ kind: "end-tagged", tag: String(tag) }));
	return result(true, undefined);
}

function taggedCounter(runtime, args) {
	const tag = readJavaLong(runtime, args[0]);
	const name = readGuestText(runtime, args[1]);
	const value = Number(args[2]) | 0;
	traceState(runtime).events.push(Object.freeze({ kind: "counter-tagged", name, tag: String(tag), value }));
	return result(true, undefined);
}

function namedCounter(runtime, args) {
	const name = readGuestText(runtime, args[0]);
	const value = readJavaLong(runtime, args[1]);
	traceState(runtime).events.push(Object.freeze({ kind: "counter", name, value: String(value) }));
	return result(true, undefined);
}

function traceState(runtime) {
	if (runtime.androidTraceState) return runtime.androidTraceState;
	runtime.androidTraceState = { async: new Map(), events: [], sections: [] };
	return runtime.androidTraceState;
}

function method(name, descriptor) {
	return Object.freeze({
		accessFlags: 0x9,
		classType: ANDROID_TRACE_CLASS,
		descriptor,
		name,
		signature: `${ANDROID_TRACE_CLASS}->${name}${descriptor}`,
		staticMethod: true,
		targetKind: "framework"
	});
}

function result(handled, value) {
	return Object.freeze({ handled, value });
}
