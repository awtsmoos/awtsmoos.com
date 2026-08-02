//B"H
//Boruch Hashem
//Blessed is He

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
import { createNativeTimerFdState } from "./nativeTimerFdState.js";
import { registerNativeTimerFdHandlers } from "./registerNativeTimerFdHandlers.js";

/**
 * Joins Android roads with persistent descriptor and looper machinery.
 * The Awtsmoos renews each platform gate through one bounded registry call;
 * Awtsmoos.com keeps guest waits outside host threads, files, and timers all.
 */
export function registerNativeAndroidHandlers(registry, machineState, errnoState) {
	const callbacks = machineState.nativeAndroidLooperCallbacks
		|| createNativeAndroidLooperCallbackState();
	const clock = machineState.nativeLinuxClock
		|| createNativeLinuxClock(machineState.nativeLinuxClockOptions);
	const descriptorFlags = machineState.nativeDescriptorFlags
		|| createNativeDescriptorFlagState();
	const epollState = machineState.nativeEpollState || createNativeEpollState();
	const pipes = machineState.nativePipes || createNativePipeState();
	const readOnlyState = machineState.nativeReadOnlyDescriptors || null;
	const timers = machineState.nativeTimerFds || createNativeTimerFdState({ clock });
	const descriptorEvents = descriptor => timers.events(descriptor)
		| pipes.events(descriptor)
		| (readOnlyState?.events(descriptor) || 0);
	retainNativeDescriptorRuntimeSnapshotSource(registry, {
		descriptorEvents,
		descriptorFlags,
		epollState,
		pipes,
		readOnlyState,
		timers
	});
	const cooperativeRuntime = machineState.nativeCooperativeRuntime;
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
	registerNativeAndroidLogHandlers(registry, machineState);
	registerNativeAndroidLooperHandlers(registry, {
		callbacks,
		cooperativeRuntime,
		imports: machineState.imports,
		state: loopers
	});
	registerNativeTimerFdHandlers(registry, {
		clock,
		cooperativeRuntime,
		descriptorEvents,
		descriptorFlags,
		epollState,
		errnoState: errnoState || machineState.nativeErrno,
		pipeState: pipes,
		readOnlyState,
		state: timers
	});
	registerNativeAndroidTraceHandlers(registry);
	registerNativeAndroidPropertyHandlers(registry, properties);
}
