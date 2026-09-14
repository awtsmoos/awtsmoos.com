//B"H
//Boruch Hashem
//Blessed be He

/**
 * Runs one FlutterJNI invocation while owning the persistent platform-thread lease.
 *
 * JNI-to-Java re-entry may await browser promises, but Android still considers that
 * logical work to be executing on the same platform thread. The lease therefore spans
 * the entire awaited invocation. Only a successful outermost return rechecks pending
 * descriptor readiness, matching ALooper service after control returns to Java.
 *
 * @param {object} session Persistent Flutter native session.
 * @param {Function} operation Function performing one registered native invocation.
 * @returns {Promise<*>} Authentic invocation result.
 */
export async function runFrameworkFlutterNativeRootExecution(session, operation) {
	const state = session?.state;
	const lease = state?.nativeRootExecution;
	if (!lease?.enter || !lease?.leave) {
		return operation();
	}
	lease.enter();
	let completed = false;
	try {
		const value = await operation();
		completed = true;
		return value;
	} finally {
		const released = lease.leave();
		if (completed && released.idle) {
			state.nativeCooperativeRuntime?.notifyDescriptors?.();
		}
	}
}
