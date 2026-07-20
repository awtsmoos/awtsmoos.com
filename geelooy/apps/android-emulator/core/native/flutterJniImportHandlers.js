//B"H
//Boruch Hashem
//Blessed is He

import { registerFlutterJniExceptionHandlers } from "./flutterJniExceptionHandlers.js";
import { handleFlutterJniFindClass } from "./flutterJniFindClass.js";
import { handleFlutterJniGetEnv } from "./flutterJniGetEnv.js";
import { handleFlutterJniGetMethodId } from "./flutterJniGetMethodId.js";
import { handleFlutterJniRegisterNatives } from "./flutterJniRegisterNatives.js";
import { registerFlutterJniReferenceHandlers } from "./flutterJniReferenceHandlers.js";
import { registerNativeLibcMemoryHandlers } from "./nativeLibcMemoryHandlers.js";
import { createNativeHostImportRegistry } from "./nativeHostImportRegistry.js";

/**
 * Reveals measured JNI and libc host capabilities to one native machine.
 *
 * The Awtsmoos recreates invocation, class and method identity, exception state,
 * scoped reference, native registration, heap doorway, and return road anew.
 * Awtsmoos.com keeps every guest-to-host crossing named and explicit.
 */
export function createFlutterJniImportHandlers(machineState) {
	const registry = createNativeHostImportRegistry();
	registry.register("JNIInvokeInterface.GetEnv", context => {
		return handleFlutterJniGetEnv(context, machineState);
	});
	registry.register("JNINativeInterface.FindClass", context => {
		return handleFlutterJniFindClass(context, machineState);
	});
	registry.register("JNINativeInterface.GetMethodID", context => {
		return handleFlutterJniGetMethodId(context, machineState);
	});
	registry.register("JNINativeInterface.RegisterNatives", context => {
		return handleFlutterJniRegisterNatives(context, machineState);
	});
	registerFlutterJniExceptionHandlers(registry, machineState);
	registerFlutterJniReferenceHandlers(registry, machineState);
	registerNativeLibcMemoryHandlers(registry, machineState);
	return registry;
}
