//B"H
//Boruch Hashem
//Blessed be He

/**
 * Emits one immutable Android launch milestone to an optional host observer.
 *
 * The callback is deliberately synchronous so a diagnostic harness may persist
 * the latest stage before a long guest/native turn monopolizes the event loop.
 * Browser consumers can use the same event to render truthful boot progress.
 *
 * @param {object} options Android launch options containing an optional observer.
 * @param {string} stage Stable machine-readable launch stage.
 * @param {object} details Bounded stage-specific diagnostic details.
 * @returns {boolean} True when a configured observer received the milestone.
 */
export function notifyAndroidLaunchProgress(options, stage, details = {}) {
	const observer = options?.onLaunchProgress;
	if (observer === undefined || observer === null) return false;
	if (typeof observer !== "function") {
		throw launchProgressError("ANDROID_LAUNCH_PROGRESS_OBSERVER_INVALID");
	}
	const event = Object.freeze({
		details: Object.freeze({ ...details }),
		stage: String(stage),
		timestampMs: Date.now()
	});
	observer(event);
	return true;
}

/** Creates a coded configuration error for an invalid progress observer. */
function launchProgressError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}
