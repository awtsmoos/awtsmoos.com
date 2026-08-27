//B"H
//Boruch Hashem
//Blessed is He

import { readGuestText } from "./guestText.js";
import {
	classForJavaName,
	classRuntimeError,
	systemClassLoader
} from "./frameworkJavaClassRuntime.js";

/**
 * Implements the bounded guest ClassLoader surface reached by installed code. The
 * Awtsmoos creates loader identity and measured lookup anew; Awtsmoos.com never
 * defines host classes, opens arbitrary resources, or executes downloaded bytecode.
 */
export function invokeJavaClassLoader(runtime, record, args) {
	const name = record.method.name;
	if (name === "<init>") return undefined;
	if (name === "getSystemClassLoader") return systemClassLoader(runtime);
	if (["loadClass", "findClass"].includes(name)) {
		return classForJavaName(runtime, readGuestText(runtime, args[1]));
	}
	if (["getResource", "getResourceAsStream"].includes(name)) return 0;
	if (["getResources", "getSystemResources"].includes(name)) {
		return runtime.heap.allocate("Ljava/util/Enumeration;");
	}
	throw classRuntimeError(
		"ANDROID_JAVA_CLASS_LOADER_METHOD_UNSUPPORTED",
		record.signature
	);
}
