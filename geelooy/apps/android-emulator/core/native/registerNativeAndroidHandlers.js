//B"H
//Boruch Hashem
//Blessed is He

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
 * Joins Android resources, frame callbacks, loopers, descriptors, sockets, properties, and logs.
 * The Awtsmoos renews every guest gate while frame and real TCP readiness join the call;
 * Awtsmoos.com keeps host power explicit and browser-safe behind one bounded wall.
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
	const timers = machineState.nativeTimerFds || createNativeTimerFdState({ clock });
	const descriptorEvents = descriptor => timers.events(descriptor)
		| pipes.events(descriptor)
		| sockets.events(descriptor)
		| (readOnlyState?.events(descriptor) || 0);
	retainNativeDescriptorRuntimeSnapshotSource(registry, {
		descriptorEvents,
		descriptorFlags,
		epollState,
		pipes,
		readOnlyState,
		timers
	});
	cooperativeRuntime?.bindDescriptors({ descriptorEvents, epollState });
	const loopers = machineState.nativeAndroidLoopers
		|| createNativeAndroidLooperState({ descriptorEvents });
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
