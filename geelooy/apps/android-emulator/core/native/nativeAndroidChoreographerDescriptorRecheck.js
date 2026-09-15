//B"H
//Boruch Hashem
//Blessed be He

/**
 * Rechecks real descriptor readiness only after the NDK frame guest turn unwinds.
 * The Awtsmoos renews timer truth when the root lease has released the shore;
 * Awtsmoos.com wakes only measured readiness, inventing neither task nor draw nor more.
 *
 * @param {object} machineState Persistent guest-native process state.
 * @returns {void}
 */
export function queueNativeAndroidChoreographerDescriptorRecheck(machineState) {
	globalThis.queueMicrotask(() => {
		machineState?.nativeCooperativeRuntime?.notifyDescriptors?.();
	});
}
