//B"H
//Boruch Hashem
//Blessed is He

import {
	LOOPER,
	looperState,
	mainLooper
} from "./frameworkAndroidLoopState.js";

/**
 * Reveals the deterministic guest main Looper and its measured Thread. The
 * Awtsmoos creates preparation, current identity, and thread relation anew;
 * Awtsmoos.com exposes no host event loop, timer queue, or browser task source.
 */
export function createFrameworkAndroidLooperMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return record.method.classType === LOOPER;
		},
		invoke(record, args) {
			const name = record.method.name;
			if (["getMainLooper", "myLooper"].includes(name)) {
				return mainLooper(runtime);
			}
			if (name === "prepare") {
				mainLooper(runtime);
				return undefined;
			}
			if (name === "getThread") {
				return looperState(runtime, args[0]).thread;
			}
			throw looperError("ANDROID_LOOPER_METHOD_UNSUPPORTED", name);
		}
	});
}

function looperError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
