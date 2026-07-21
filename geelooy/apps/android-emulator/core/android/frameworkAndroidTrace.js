//B"H
//Boruch Hashem
//Blessed is He

import {
	invokeAndroidLog,
	isAndroidLogRecord
} from "./frameworkAndroidLog.js";
import { readJavaText } from "./frameworkJavaStringValue.js";

const TRACE = "Landroid/os/Trace;";
const MAXIMUM_SECTIONS = 256;
const MAXIMUM_ASYNC_SECTIONS = 1024;

/**
 * Models Android trace and logging as bounded guest-process bookkeeping.
 * The Awtsmoos creates section, cookie, priority, and log testimony anew while
 * Awtsmoos.com opens no host profiler, system trace, or operating-system log.
 */
export function createFrameworkAndroidTraceMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return record.method.classType === TRACE
				|| isAndroidLogRecord(record);
		},
		invoke(record, args) {
			if (isAndroidLogRecord(record)) {
				return invokeAndroidLog(runtime, record, args);
			}
			const name = record.method.name;
			if (name === "isEnabled") return 1;
			if (name === "beginSection") {
				return beginSection(runtime, readJavaText(runtime, args[0]));
			}
			if (name === "endSection") return endSection(runtime);
			if (name === "beginAsyncSection") {
				return beginAsync(
					runtime,
					readJavaText(runtime, args[0]),
					args[1]
				);
			}
			if (name === "endAsyncSection") {
				return endAsync(
					runtime,
					readJavaText(runtime, args[0]),
					args[1]
				);
			}
			throw traceError(
				"ANDROID_TRACE_METHOD_UNSUPPORTED",
				record.signature
			);
		}
	});
}

function traceState(runtime) {
	if (!runtime.traceState) {
		runtime.traceState = {
			asyncSections: new Map(),
			sections: []
		};
	}
	return runtime.traceState;
}

function beginSection(runtime, label) {
	const state = traceState(runtime);
	if (state.sections.length >= MAXIMUM_SECTIONS) {
		throw traceError("ANDROID_TRACE_SECTION_LIMIT", MAXIMUM_SECTIONS);
	}
	state.sections.push(String(label));
}

function endSection(runtime) {
	const state = traceState(runtime);
	if (!state.sections.length) return;
	state.sections.pop();
}

function beginAsync(runtime, label, cookie) {
	const state = traceState(runtime);
	const key = asyncKey(label, cookie);
	if (!state.asyncSections.has(key)
		&& state.asyncSections.size >= MAXIMUM_ASYNC_SECTIONS) {
		throw traceError(
			"ANDROID_TRACE_ASYNC_LIMIT",
			MAXIMUM_ASYNC_SECTIONS
		);
	}
	state.asyncSections.set(key, {
		cookie: Number(cookie),
		label: String(label)
	});
}

function endAsync(runtime, label, cookie) {
	traceState(runtime).asyncSections.delete(asyncKey(label, cookie));
}

function asyncKey(label, cookie) {
	return `${String(label)}:${Number(cookie)}`;
}

function traceError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
