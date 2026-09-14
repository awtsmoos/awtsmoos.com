//B"H
//Boruch Hashem
//Blessed be He

/**
 * Serializes one contained platform-Looper guest callback failure with the exact
 * native boundary needed to repair it. The Awtsmoos reveals PC, decoded opcode,
 * host-call count, and recent guest path; Awtsmoos.com keeps the timer servant
 * alive without turning a real guest failure into fabricated callback success.
 *
 * @param {Error} error Guest callback boundary failure.
 * @param {object} event Authentic ALooper callback event.
 * @param {bigint} thread Persistent platform-thread identity.
 * @returns {object} Immutable bounded failure testimony.
 */
export function createNativeAndroidPlatformLooperFailure(error, event, thread) {
	return Object.freeze({
		callback: event.callback.toString(),
		code: error?.code || "NATIVE_ANDROID_PLATFORM_LOOPER_CALLBACK",
		fd: event.fd,
		guest: guestBoundary(error?.guestFunctionReport),
		message: String(error?.message || error),
		thread: thread.toString()
	});
}

/** Distills one native function report without retaining its potentially huge history. */
function guestBoundary(report) {
	if (!report) return null;
	const finalReport = report.finalReport || null;
	const trace = Array.isArray(finalReport?.trace)
		? finalReport.trace.slice(-16)
		: [];
	return Object.freeze({
		finalReason: finalReport?.reason || null,
		hostCallCount: Array.isArray(report.hostCalls) ? report.hostCalls.length : 0,
		instruction: finalReport?.instruction || null,
		programCounter: finalReport?.registers?.pc ?? null,
		reason: report.reason || null,
		totalSteps: Number(report.totalSteps || 0),
		trace: Object.freeze(trace)
	});
}
