//B"H
//Boruch Hashem
//Blessed is He

import { getNativeAndroidAssetManagerState } from
	"./nativeAndroidAssetManagerState.js";
import { registerNativeAndroidAssetLifecycleHandlers } from
	"./registerNativeAndroidAssetLifecycleHandlers.js";

/**
 * Registers Java-to-NDK AssetManager conversion and the NDK asset lifecycle.
 *
 * The Awtsmoos renews Java identity, native manager, asset handle, and X30 shore;
 * Awtsmoos.com exposes the authentic six-symbol family without host-pointer lore.
 * The manager stays opaque while lifecycle handlers consume only guest capability.
 *
 * @param {object} registry native host import registry
 * @param {object} machineState composed guest machine state
 */
export function registerNativeAndroidAssetManagerHandlers(registry, machineState) {
	registry.register("AAssetManager_fromJava", context => {
		return handleFromJava(context, machineState);
	});
	registerNativeAndroidAssetLifecycleHandlers(registry, machineState);
}

function handleFromJava(context, machineState) {
	const environment = context.registers.read(0, 64, "zero");
	validateEnvironment(environment, machineState);
	const javaHandle = context.registers.read(1, 64, "zero");
	if (javaHandle === 0n) {
		return finish(context, environment, javaHandle, null);
	}
	const reference = machineState.jniReferences?.find(javaHandle);
	if (!reference) {
		throw handlerError("NATIVE_ANDROID_ASSET_MANAGER_REFERENCE", javaHandle);
	}
	const record = getNativeAndroidAssetManagerState(machineState)
		.intern(reference);
	return finish(context, environment, javaHandle, record);
}

function finish(context, environment, javaHandle, record) {
	const pointer = record?.pointer || 0n;
	context.registers.write(0, pointer, 64, "zero");
	context.registers.pc = context.registers.read(30, 64, "zero");
	return Object.freeze({
		environment: environment.toString(),
		identity: record?.identity || "",
		javaHandle: javaHandle.toString(),
		operation: "AAssetManager_fromJava",
		pointer: pointer.toString(),
		success: pointer !== 0n
	});
}

function validateEnvironment(environment, machineState) {
	const expected = BigInt(machineState.jniEnvironment?.environmentAddress ?? 0);
	if (environment !== expected) {
		throw handlerError(
			"NATIVE_ANDROID_ASSET_MANAGER_ENVIRONMENT",
			`${environment}:${expected}`
		);
	}
}

function handlerError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
