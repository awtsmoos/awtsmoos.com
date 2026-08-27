//B"H
//Boruch Hashem
//Blessed is He

import { createGuestString } from "./guestText.js";
import { readJavaText } from "./frameworkJavaStringValue.js";

const ANDROID_LOG = "Landroid/util/Log;";
const LEVEL_METHODS = Object.freeze({
	d: "debug",
	e: "error",
	i: "info",
	v: "debug",
	w: "warn",
	wtf: "error"
});
const PRIORITY_METHODS = Object.freeze({
	2: "debug",
	3: "debug",
	4: "info",
	5: "warn",
	6: "error",
	7: "error"
});

/**
 * Appends Android Log calls to one bounded deterministic guest-process logcat.
 *
 * The Awtsmoos recreates priority, tag, message, throwable type, and sequence
 * anew. Awtsmoos.com never prints guest logs into the host system log or invents
 * a host stack trace for a guest Throwable.
 */
export function isAndroidLogRecord(record) {
	return record.method.classType === ANDROID_LOG;
}

export function invokeAndroidLog(runtime, record, args) {
	const name = record.method.name;
	if (name === "isLoggable") return 1;
	if (name === "getStackTraceString") {
		return createGuestString(runtime, throwableText(runtime, args[0]));
	}
	if (name === "println") {
		return appendLog(
			runtime,
			PRIORITY_METHODS[Number(args[0])] || "debug",
			readJavaText(runtime, args[1]),
			readJavaText(runtime, args[2])
		);
	}
	const method = LEVEL_METHODS[name];
	if (!method) {
		throw logError("ANDROID_LOG_METHOD_UNSUPPORTED", record.signature);
	}
	const tag = readJavaText(runtime, args[0]);
	const message = logMessage(runtime, record.method.descriptor, args);
	return appendLog(runtime, method, tag, message);
}

function logMessage(runtime, descriptor, args) {
	if (descriptor === "(Ljava/lang/String;Ljava/lang/Throwable;)I") {
		return throwableText(runtime, args[1]);
	}
	const message = readJavaText(runtime, args[1]);
	if (args.length < 3) return message;
	return `${message}
${throwableText(runtime, args[2])}`;
}

function appendLog(runtime, method, tag, message) {
	const normalized = String(message);
	runtime.logcat[method](tag, normalized);
	return normalized.length;
}

function throwableText(runtime, reference) {
	if (!reference) return "";
	const record = runtime.heap.get(reference);
	return String(record.type || "Ljava/lang/Throwable;");
}

function logError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
