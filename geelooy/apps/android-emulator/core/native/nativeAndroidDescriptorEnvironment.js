//B"H
//Boruch Hashem
//Blessed be He

import { createNativeAndroidLooperState } from "./nativeAndroidLooperState.js";
import { createNativeDescriptorFlagState } from "./nativeDescriptorFlagState.js";
import { createNativeEpollState } from "./nativeEpollState.js";
import { createNativeLinuxClock } from "./nativeLinuxClock.js";
import { createNativePipeState } from "./nativePipeState.js";
import { createNativeSocketState } from "./nativeSocketState.js";
import { createNativeTimerFdState } from "./nativeTimerFdState.js";

/**
 * Constructs one coherent Android/Linux descriptor universe for a Flutter machine.
 *
 * Timerfds, pipes, sockets, read-only descriptors, epoll, and ALooper readiness all
 * share one non-consuming `descriptorEvents` probe. Timer host deadlines notify the
 * cooperative runtime, which can then wake child waits and service the root platform
 * ALooper without inventing readiness or consuming guest-owned descriptor bytes.
 *
 * @param {object} machineState Persistent Flutter JNI machine state.
 * @param {?object} cooperativeRuntime Shared cooperative readiness coordinator.
 * @returns {object} Frozen descriptor environment used by Android registrations.
 */
export function createNativeAndroidDescriptorEnvironment(
	machineState,
	cooperativeRuntime
) {
	const clock = machineState.nativeLinuxClock
		|| createNativeLinuxClock(machineState.nativeLinuxClockOptions);
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
	const descriptorEvents = descriptor => {
		return timers.events(descriptor)
			| pipes.events(descriptor)
			| sockets.events(descriptor)
			| (readOnlyState?.events(descriptor) || 0);
	};
	const loopers = machineState.nativeAndroidLoopers
		|| createNativeAndroidLooperState({ descriptorEvents });
	return Object.freeze({
		clock,
		descriptorEvents,
		descriptorFlags,
		epollState,
		loopers,
		pipes,
		readOnlyState,
		sockets,
		timers
	});
}
