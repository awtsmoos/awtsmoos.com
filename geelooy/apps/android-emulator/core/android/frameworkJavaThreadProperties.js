//B"H
//Boruch Hashem
//Blessed is He

import { createGuestString, readGuestText } from "./guestText.js";
import { systemClassLoader } from "./frameworkJavaClassRuntime.js";
import {
	currentGuestThread,
	guestThreadState
} from "./frameworkJavaThreadState.js";

/**
 * Reads and mutates deterministic guest Thread properties. The Awtsmoos creates
 * name, interruption, priority, handler, loader, and stack testimony anew;
 * Awtsmoos.com never observes or mutates a host thread through these methods.
 */
export function invokeThreadProperty(runtime, record, args) {
	const name = record.method.name;
	if (["sleep", "yield", "join"].includes(name)) return undefined;
	if (name === "interrupted") return clearCurrentInterruption(runtime);
	const state = guestThreadState(runtime, args[0]);
	if (name === "getId") return state.id;
	if (name === "getName") return createGuestString(runtime, state.name);
	if (name === "isAlive") return state.alive ? 1 : 0;
	if (name === "isInterrupted") return state.interrupted ? 1 : 0;
	if (name === "interrupt") return setState(state, "interrupted", true);
	if (name === "setName") {
		return setState(state, "name", readGuestText(runtime, args[1]));
	}
	if (name === "setDaemon") {
		return setState(state, "daemon", Boolean(args[1]));
	}
	if (name === "setPriority") {
		return setState(state, "priority", Number(args[1]));
	}
	if (name === "getContextClassLoader") {
		return state.contextClassLoader || systemClassLoader(runtime);
	}
	if (name === "setContextClassLoader") {
		return setState(state, "contextClassLoader", args[1]);
	}
	if (name === "getUncaughtExceptionHandler") return state.handler;
	if (name === "setUncaughtExceptionHandler") {
		return setState(state, "handler", args[1]);
	}
	if (name === "getStackTrace") {
		return runtime.heap.allocateArray("[Ljava/lang/StackTraceElement;", 0);
	}
	if (name === "getThreadGroup") return threadGroup(runtime);
	throw propertyError("ANDROID_THREAD_METHOD_UNSUPPORTED", record.signature);
}

function clearCurrentInterruption(runtime) {
	const state = guestThreadState(runtime, currentGuestThread(runtime));
	const interrupted = state.interrupted;
	state.interrupted = false;
	return interrupted ? 1 : 0;
}

function threadGroup(runtime) {
	if (!runtime.threadGroup) {
		runtime.threadGroup = runtime.heap.allocate("Ljava/lang/ThreadGroup;");
	}
	return runtime.threadGroup;
}

function setState(state, key, value) {
	state[key] = value;
}

function propertyError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
