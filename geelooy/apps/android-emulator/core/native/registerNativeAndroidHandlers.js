//B"H
//Boruch Hashem
//Blessed be He

import { registerNativeAndroidAssetManagerHandlers } from "./nativeAndroidAssetManagerHandlers.js";
import { registerNativeAndroidChoreographerHandlers } from "./nativeAndroidChoreographerHandlers.js";
import { createNativeAndroidDescriptorEnvironment } from "./nativeAndroidDescriptorEnvironment.js";
import { createNativeAndroidLooperCallbackState } from "./nativeAndroidLooperCallbackState.js";
import { createNativeAndroidPlatformLooperPump } from "./nativeAndroidPlatformLooperPump.js";
import { registerNativeAndroidLogHandlers } from "./nativeAndroidLogHandlers.js";
import { registerNativeAndroidLooperHandlers } from "./registerNativeAndroidLooperHandlers.js";
import { registerNativeAndroidPropertyHandlers } from "./nativeAndroidPropertyHandlers.js";
import { createNativeAndroidPropertyState } from "./nativeAndroidPropertyState.js";
import { registerNativeAndroidTraceHandlers } from "./nativeAndroidTraceHandlers.js";
import { retainNativeDescriptorRuntimeSnapshotSource } from "./nativeDescriptorRuntimeSnapshot.js";
import { registerNativeSocketHandlers } from "./registerNativeSocketHandlers.js";
import { registerNativeTimerFdHandlers } from "./registerNativeTimerFdHandlers.js";

/**
 * Registers Android resources, platform looping, descriptors, sockets, and logs.
 *
 * Root-platform ALooper service is explicitly distinct from child pthread waits.
 * Every Linux readiness path shares one descriptor environment, so timers, sockets,
 * epoll, and loopers observe the same guest truth without host-side fake success.
 *
 * @param {object} registry Native import registry receiving Android handlers.
 * @param {object} machineState Persistent guest machine and explicit host adapters.
 * @param {?object} errnoState Optional thread-local errno vessel.
 * @returns {void} Registration mutates only the supplied runtime registries.
 */
export function registerNativeAndroidHandlers(registry, machineState, errnoState) {
	const callbacks = machineState.nativeAndroidLooperCallbacks
		|| createNativeAndroidLooperCallbackState();
	const cooperativeRuntime = machineState.nativeCooperativeRuntime;
	const environment = createNativeAndroidDescriptorEnvironment(
		machineState,
		cooperativeRuntime
	);
	const platformLooperPump = createNativeAndroidPlatformLooperPump({
		machineState,
		registry,
		state: environment.loopers
	});
	retainNativeDescriptorRuntimeSnapshotSource(registry, environment);
	cooperativeRuntime?.bindDescriptors({
		descriptorEvents: environment.descriptorEvents,
		epollState: environment.epollState
	});
	cooperativeRuntime?.bindLoopers({
		callbacks,
		imports: machineState.imports,
		state: environment.loopers
	});
	cooperativeRuntime?.bindPlatformLooperPump(platformLooperPump);
	const properties = machineState.nativeAndroidProperties
		|| createNativeAndroidPropertyState({
			apiLevel: machineState.androidApiLevel ?? 35,
			overrides: machineState.nativeAndroidPropertyOverrides
		});
	registerNativeAndroidAssetManagerHandlers(registry, machineState);
	registerNativeAndroidChoreographerHandlers(registry, machineState);
	registerNativeAndroidLogHandlers(registry, machineState);
	registerNativeAndroidLooperHandlers(registry, {
		callbacks,
		cooperativeRuntime,
		imports: machineState.imports,
		state: environment.loopers
	});
	const descriptorOptions = {
		clock: environment.clock,
		cooperativeRuntime,
		descriptorEvents: environment.descriptorEvents,
		descriptorFlags: environment.descriptorFlags,
		epollState: environment.epollState,
		errnoState: errnoState || machineState.nativeErrno,
		pipeState: environment.pipes,
		readOnlyState: environment.readOnlyState,
		socketState: environment.sockets,
		state: environment.timers
	};
	registerNativeTimerFdHandlers(registry, descriptorOptions);
	registerNativeSocketHandlers(registry, {
		...descriptorOptions,
		nativeHeap: machineState.nativeHeap
	});
	registerNativeAndroidTraceHandlers(registry);
	registerNativeAndroidPropertyHandlers(registry, properties);
}
