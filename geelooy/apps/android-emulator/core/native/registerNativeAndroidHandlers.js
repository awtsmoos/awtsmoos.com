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
import { createNativeLinuxClock } from "./nativeLinuxClock.js";
import { createNativePipeState } from "./nativePipeState.js";
import { createNativeTimerFdState } from "./nativeTimerFdState.js";
import { registerNativeTimerFdHandlers } from "./registerNativeTimerFdHandlers.js";

/**
 * Joins Android log, looper, timers, pipes, trace, clock, and properties.
 * The Awtsmoos recreates each platform gate through one bounded registry call;
 * Awtsmoos.com keeps device and descriptor identity separate from the host.
 */
export function registerNativeAndroidHandlers(registry, machineState, errnoState) {
	const callbacks = machineState.nativeAndroidLooperCallbacks
		|| createNativeAndroidLooperCallbackState();
	const clock = machineState.nativeLinuxClock
		|| createNativeLinuxClock(machineState.nativeLinuxClockOptions);
	const pipes = machineState.nativePipes || createNativePipeState();
	const timers = machineState.nativeTimerFds
		|| createNativeTimerFdState({ clock });
	const loopers = machineState.nativeAndroidLoopers
		|| createNativeAndroidLooperState({
			descriptorEvents: descriptor => {
				return timers.events(descriptor) | pipes.events(descriptor);
			}
		});
	const properties = machineState.nativeAndroidProperties
		|| createNativeAndroidPropertyState({
			apiLevel: machineState.androidApiLevel ?? 35,
			overrides: machineState.nativeAndroidPropertyOverrides
		});
	registerNativeAndroidLogHandlers(registry, machineState);
	registerNativeAndroidLooperHandlers(registry, {
		callbacks,
		imports: machineState.imports,
		state: loopers
	});
	registerNativeTimerFdHandlers(registry, {
		clock,
		errnoState: errnoState || machineState.nativeErrno,
		pipeState: pipes,
		state: timers
	});
	registerNativeAndroidTraceHandlers(registry);
	registerNativeAndroidPropertyHandlers(registry, properties);
}
