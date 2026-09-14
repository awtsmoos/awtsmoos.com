//B"H
//Boruch Hashem
//Blessed be He

import { jniGuestThreadKey } from "./jniGuestThreadKey.js";
import { createJniPrimitiveArrayCopies } from "./flutterJniPrimitiveArrayCopies.js";
import {
	getJniPrimitiveArrayElements,
	releaseJniPrimitiveArrayElements
} from "./flutterJniPrimitiveArrayElements.js";
import {
	getJniPrimitiveArrayRegion,
	setJniPrimitiveArrayRegion
} from "./flutterJniPrimitiveArrayRegions.js";
import { JNI_PRIMITIVE_ARRAY_SPECS } from "./flutterJniPrimitiveArraySpecs.js";
import {
	readJniArraySize,
	requireJniArrayCapabilities,
	resumeJniPrimitiveArray,
	validateJniPrimitiveArrayEnvironment
} from "./flutterJniPrimitiveArraySupport.js";

/**
 * Registers forty typed JNI primitive-array functions plus critical access.
 * All element pointers are tracked guest-native copies with JNI commit/abort behavior.
 */
export function registerFlutterJniPrimitiveArrayHandlers(registry, machineState) {
	const copies = createJniPrimitiveArrayCopies();
	for (const spec of JNI_PRIMITIVE_ARRAY_SPECS) {
		registerSpec(registry, machineState, copies, spec);
	}
	registry.register("JNINativeInterface.GetPrimitiveArrayCritical", context => {
		return getJniPrimitiveArrayElements(context, machineState, copies, null, true);
	});
	registry.register("JNINativeInterface.ReleasePrimitiveArrayCritical", context => {
		return releaseJniPrimitiveArrayElements(context, machineState, copies, null, true);
	});
	return registry;
}

function registerSpec(registry, machineState, copies, spec) {
	registry.register(`JNINativeInterface.New${spec.stem}Array`, context => {
		return newArray(context, machineState, spec);
	});
	registry.register(`JNINativeInterface.Get${spec.stem}ArrayElements`, context => {
		return getJniPrimitiveArrayElements(context, machineState, copies, spec, false);
	});
	registry.register(`JNINativeInterface.Release${spec.stem}ArrayElements`, context => {
		return releaseJniPrimitiveArrayElements(context, machineState, copies, spec, false);
	});
	registry.register(`JNINativeInterface.Get${spec.stem}ArrayRegion`, context => {
		return getJniPrimitiveArrayRegion(context, machineState, spec);
	});
	registry.register(`JNINativeInterface.Set${spec.stem}ArrayRegion`, context => {
		return setJniPrimitiveArrayRegion(context, machineState, spec);
	});
}

function newArray(context, machineState, spec) {
	const registers = context.registers;
	validateJniPrimitiveArrayEnvironment(registers, machineState);
	const length = readJniArraySize(registers, 1, "length");
	const capabilities = requireJniArrayCapabilities(machineState);
	const target = capabilities.createArray(spec.descriptor, length);
	const handle = machineState.jniReferences.create(
		"array",
		`${spec.descriptor}#dalvik-${target.id}`,
		target,
		{
			dalvikId: target.id,
			dalvikType: spec.descriptor,
			descriptor: spec.descriptor,
			scope: "local"
		},
		jniGuestThreadKey(context)
	);
	registers.write(0, handle, 64, "zero");
	resumeJniPrimitiveArray(registers);
	return Object.freeze({
		descriptor: spec.descriptor,
		handle: handle.toString(),
		length,
		operation: `New${spec.stem}Array`
	});
}
