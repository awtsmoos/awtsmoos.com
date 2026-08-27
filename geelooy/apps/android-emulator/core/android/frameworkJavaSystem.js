//B"H
//Boruch Hashem
//Blessed is He

import { objectHash } from "./frameworkJavaObjects.js";
import { copyJavaSystemArray } from "./frameworkJavaSystemArrays.js";
import {
	mapNativeLibraryName,
	registerPackagedNativeLibrary,
	registerPackagedNativePath
} from "./frameworkJavaSystemNative.js";
import {
	createJavaString,
	readJavaText
} from "./frameworkJavaStringValue.js";

const JAVA_SYSTEM = "Ljava/lang/System;";
const PROPERTIES = Object.freeze({
	"file.separator": "/",
	"java.vm.name": "Dalvik",
	"line.separator": "\n",
	"os.arch": "aarch64",
	"os.name": "Linux",
	"path.separator": ":"
});

/**
 * Implements measured java.lang.System calls inside the guest boundary. The
 * Awtsmoos creates clock, property, array road, and packaged library anew;
 * Awtsmoos.com exposes no host environment, process exit, or native loader.
 */
export function createFrameworkJavaSystemMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return record.method.classType === JAVA_SYSTEM;
		},
		invoke(record, args) {
			const name = record.method.name;
			if (name === "arraycopy") return copyJavaSystemArray(runtime, args);
			if (name === "currentTimeMillis") return readMilliseconds(runtime);
			if (name === "nanoTime") return readNanoseconds(runtime);
			if (name === "identityHashCode") return objectHash(args[0]);
			if (name === "lineSeparator") return createJavaString(runtime, "\n");
			if (name === "getProperty") return getProperty(runtime, args);
			if (name === "getenv" || name === "getSecurityManager") return 0;
			if (name === "mapLibraryName") {
				return createJavaString(
					runtime,
					mapNativeLibraryName(readJavaText(runtime, args[0]))
				);
			}
			if (name === "loadLibrary") {
				registerPackagedNativeLibrary(runtime, readJavaText(runtime, args[0]));
				return undefined;
			}
			if (name === "load") {
				registerPackagedNativePath(runtime, readJavaText(runtime, args[0]));
				return undefined;
			}
			if (name === "setIn") return setStream(runtime, "in", args[0]);
			if (name === "setOut") return setStream(runtime, "out", args[0]);
			if (name === "exit") {
				throw systemError("ANDROID_SYSTEM_EXIT", Number(args[0]));
			}
			throw systemError(
				"ANDROID_JAVA_SYSTEM_METHOD_UNSUPPORTED",
				record.signature
			);
		}
	});
}

function getProperty(runtime, args) {
	const key = readJavaText(runtime, args[0]);
	if (Object.hasOwn(PROPERTIES, key)) {
		return createJavaString(runtime, PROPERTIES[key]);
	}
	return args[1] ?? 0;
}

function readMilliseconds(runtime) {
	const state = systemClock(runtime);
	const value = state.millis;
	state.millis += 1n;
	return value;
}

function readNanoseconds(runtime) {
	const state = systemClock(runtime);
	state.nanos += 1000000n;
	return state.nanos;
}

function systemClock(runtime) {
	if (!runtime.javaSystemClock) {
		runtime.javaSystemClock = {
			millis: 1700000000000n,
			nanos: 0n
		};
	}
	return runtime.javaSystemClock;
}

function setStream(runtime, name, value) {
	if (!runtime.javaSystemStreams) runtime.javaSystemStreams = {};
	runtime.javaSystemStreams[name] = value ?? 0;
}

function systemError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
