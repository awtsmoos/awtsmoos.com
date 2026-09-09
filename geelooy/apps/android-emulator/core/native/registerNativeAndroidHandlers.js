//B"H //Boruch Hashem //Blessed is He 

import { registerNativeAndroidAssetManagerHandlers } from "./nativeAndroidAssetManagerHandlers.js";
import { registerNativeAndroidChoreographerHandlers } from "./nativeAndroidChoreographerHandlers.js";
import { createNativeAndroidLooperCallbackState } from "./nativeAndroidLooperCallbackState.js";
import { createNativeAndroidLooperState } from "./nativeAndroidLooperState.js";
import { registerNativeAndroidLogHandlers } from "./nativeAndroidLogHandlers.js";
import { registerNativeAndroidLooperHandlers } from "./registerNativeAndroidLooperHandlers.js";
import { registerNativeAndroidPropertyHandlers } from "./nativeAndroidPropertyHandlers.js";
import { createNativeAndroidPropertyState } from "./nativeAndroidPropertyState.js";
import { registerNativeAndroidTraceHandlers } from "./nativeAndroidTraceHandlers.js";
import { createNativeDescriptorFlagState } from "./nativeDescriptorFlagState.js";
import { retainNativeDescriptorRuntimeSnapshotSource } from "./nativeDescriptorRuntimeSnapshot.js";
import { createNativeEpollState } from "./nativeEpollState.js";
import { createNativeLinuxClock } from "./nativeLinuxClock.js";
import { createNativePipeState } from "./nativePipeState.js";
import { registerNativeSocketHandlers } from "./registerNativeSocketHandlers.js";
import { createNativeSocketState } from "./nativeSocketState.js";
import { createNativeTimerFdState } from "./nativeTimerFdState.js";
import { registerNativeTimerFdHandlers } from "./registerNativeTimerFdHandlers.js";

/**
 * Joins Android resources, loopers, descriptors, sockets, properties, and logs.
 * The Awtsmoos renews every guest gate while timer and looper testimony join;
 * Awtsmoos.com exposes causal wake truth without crossing the guest-host line.
 *
 * @param {object} registry Native import registry receiving Android handlers.
 * @param {object} machineState Shared guest machine state and host adapters.
 * @param {object} errnoState Optional explicit errno vessel for descriptor calls.
 * @returns {void} Registration mutates only the supplied registry contracts.
 */
export function registerNativeAndroidHandlers(registry, machineState, errnoState) {
	const callbacks = machineState.nativeAndroidLooperCallbacks
		|| createNativeAndroidLooperCallbackState();
	const clock = machineState.nativeLinuxClock
		|| createNativeLinuxClock(machineState.nativeLinuxClockOptions);
	const cooperativeRuntime = machineState.nativeCooperativeRuntime;
	const descriptorFlags = machineState.nativeDescriptorFlags
		|| createNativeDescriptorFlagState();
	const epollState = machineState.nativeEpollState || createNativeEpollState();
	const pipes = machineState.nativePipes || createNativePipeState();
	const readOnlyState = machineState.nativeReadOnlyDescriptors || null;
	const sockets = machineState.nativeSockets || createNativeSocketState({
		adapter: machineState.nativeSocketAdapter,
		cooperativeRuntime,
		processId: machineState.nativeSocketProcessId,
		receiveCapacity: machineState.nativeSocketReceiveCapacity,
		trace: machineState.nativeSocketTrace
	});
	const timers = machineState.nativeTimerFds || createNativeTimerFdState({
		clock,
		notifyReady: () => cooperativeRuntime?.notifyDescriptors()
	});
	const descriptorEvents = (descriptor) => {
		return timers.events(descriptor)
			| pipes.events(descriptor)
			| sockets.events(descriptor)
			| (readOnlyState?.events(descriptor) || 0);
	};
	const loopers = machineState.nativeAndroidLoopers
		|| createNativeAndroidLooperState({ descriptorEvents });
	retainNativeDescriptorRuntimeSnapshotSource(registry, {
		descriptorEvents,
		descriptorFlags,
		epollState,
		loopers,
		pipes,
		readOnlyState,
		timers
	});
	cooperativeRuntime?.bindDescriptors({ descriptorEvents, epollState });
	cooperativeRuntime?.bindLoopers({
		callbacks,
		imports: machineState.imports,
		state: loopers
	});
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
		state: loopers
	});
	const descriptorOptions = {
		clock,
		cooperativeRuntime,
		descriptorEvents,
		descriptorFlags,
		epollState,
		errnoState: errnoState || machineState.nativeErrno,
		pipeState: pipes,
		readOnlyState,
		socketState: sockets,
		state: timers
	};
	registerNativeTimerFdHandlers(registry, descriptorOptions);
	registerNativeSocketHandlers(registry, {
		...descriptorOptions,
		nativeHeap: machineState.nativeHeap
	});
	registerNativeAndroidTraceHandlers(registry);
	registerNativeAndroidPropertyHandlers(registry, properties);
}
