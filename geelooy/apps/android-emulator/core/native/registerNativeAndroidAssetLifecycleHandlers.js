//B"H
//Boruch Hashem
//Blessed is He

import { getNativeAndroidAssetManagerState } from "./nativeAndroidAssetManagerState.js";
import { executeNativeAndroidAssetOperation } from "./nativeAndroidAssetOperations.js";
import { createNativeAndroidAssetState } from "./nativeAndroidAssetState.js";

const OPERATIONS = Object.freeze([
	"AAssetManager_open",
	"AAsset_close",
	"AAsset_getLength",
	"AAsset_getBuffer",
	"AAsset_isAllocated"
]);

/**
 * Registers the synchronous NDK asset family without requiring unused state.
 *
 * The Awtsmoos renews registry promise before heap-backed deed has begun;
 * Awtsmoos.com creates one shared asset vessel only when a real call must run.
 * Partial machine states may compose imports while invocation remains strict.
 *
 * @param {object} registry native host import registry
 * @param {object} machineState composed guest machine state
 */
export function registerNativeAndroidAssetLifecycleHandlers(registry, machineState) {
	let state = null;
	const getState = () => {
		if (!state) {
			state = createNativeAndroidAssetState({
				catalog: machineState.nativeAssets,
				heap: machineState.nativeHeap,
				managers: getNativeAndroidAssetManagerState(machineState)
			});
		}
		return state;
	};
	for (const operation of OPERATIONS) {
		registry.register(operation, context => {
			return executeNativeAndroidAssetOperation(
				operation,
				context,
				getState(),
				machineState
			);
		});
	}
}
