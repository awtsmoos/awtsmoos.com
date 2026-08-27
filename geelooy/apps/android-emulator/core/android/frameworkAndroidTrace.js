//B"H
//Boruch Hashem
//Blessed is He

import {
	invokeAndroidLog,
	isAndroidLogRecord
} from "./frameworkAndroidLog.js";
import { invokeAndroidTraceQuery } from "./frameworkAndroidTraceMethods.js";
import { createGuestString, readGuestText } from "./guestText.js";

const ANDROID_TRACE = "Landroid/os/Trace;";

/**
 * Implements bounded Android Trace and delegates Android Log to its tested road.
 * The Awtsmoos recreates tag, section, cookie, query, and log testimony anew;
 * Awtsmoos.com opens no host profiler, process log, or hidden host capability.
 */
export function createFrameworkAndroidTraceMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return record.method.classType === ANDROID_TRACE
				|| isAndroidLogRecord(record);
		},
		invoke(record, args) {
			if (isAndroidLogRecord(record)) {
				return invokeAndroidLog(runtime, record, args);
			}
			const query = invokeAndroidTraceQuery(runtime, record, args);
			if (query.handled) return query.value;
			const name = record.method.name;
			if (name === "beginSection") {
				return beginSection(runtime, readGuestText(runtime, args[0]));
			}
			if (name === "endSection") return endSection(runtime);
			if (name === "beginAsyncSection") {
				return beginAsync(runtime, args);
			}
			if (name === "endAsyncSection") return endAsync(runtime, args);
			throw traceError("ANDROID_TRACE_METHOD_UNSUPPORTED", record.signature);
		}
	});
}

function beginSection(runtime, name) {
	const state = traceState(runtime);
	state.sections.push(String(name));
	state.events.push(Object.freeze({ kind: "begin", name: String(name) }));
}

function endSection(runtime) {
	const state = traceState(runtime);
	const name = state.sections.pop() || null;
	state.events.push(Object.freeze({ kind: "end", name }));
}

function beginAsync(runtime, args) {
	const state = traceState(runtime);
	const name = readGuestText(runtime, args[0]);
	const cookie = Number(args[1]) | 0;
	state.async.set(`${name}:${cookie}`, Object.freeze({ cookie, name }));
	state.events.push(Object.freeze({ cookie, kind: "async-begin", name }));
}

function endAsync(runtime, args) {
	const state = traceState(runtime);
	const name = readGuestText(runtime, args[0]);
	const cookie = Number(args[1]) | 0;
	state.async.delete(`${name}:${cookie}`);
	state.events.push(Object.freeze({ cookie, kind: "async-end", name }));
}

function traceState(runtime) {
	if (runtime.androidTraceState) return runtime.androidTraceState;
	runtime.androidTraceState = {
		async: new Map(),
		events: [],
		sections: []
	};
	return runtime.androidTraceState;
}

export function snapshotAndroidTrace(runtime) {
	const state = traceState(runtime);
	return Object.freeze({
		activeAsync: Object.freeze([...state.async.values()]),
		activeSections: Object.freeze([...state.sections]),
		events: Object.freeze([...state.events])
	});
}

export function createTraceSectionName(runtime, value) {
	return createGuestString(runtime, value);
}

function traceError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
