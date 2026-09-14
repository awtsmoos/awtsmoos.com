//B"H
//Boruch Hashem
//Blessed be He

/**
 * Resolves the persistent Android/JNI root TLS identity without inventing a pthread.
 * The explicit thread region is authoritative; TPIDR_EL0 remains a compatibility
 * fallback for focused fixtures that expose architectural state only.
 *
 * @param {object} machineState Persistent Flutter JNI machine state.
 * @returns {bigint} Root platform-thread identity, or zero when unavailable.
 */
export function nativeAndroidPlatformThread(machineState) {
	if (machineState?.thread?.pointer !== undefined) {
		return BigInt(machineState.thread.pointer);
	}
	try {
		return machineState?.systemRegisters?.read("TPIDR_EL0") || 0n;
	} catch {
		return 0n;
	}
}

/**
 * Returns whether the root thread is still occupied by an outer JNI/native call.
 * Browser promises can yield while that logical Android thread remains active;
 * ALooper service must defer until the lease reaches zero to avoid stack collision.
 *
 * @param {object} machineState Persistent Flutter JNI machine state.
 * @returns {boolean} True when platform callbacks must not execute yet.
 */
export function nativeAndroidPlatformThreadBusy(machineState) {
	return Boolean(machineState?.nativeRootExecution?.active?.());
}
