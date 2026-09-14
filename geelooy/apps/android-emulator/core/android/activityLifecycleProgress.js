//B"H
//Boruch Hashem
//Blessed be He

/**
 * Emits one bounded Activity lifecycle milestone to an optional observer.
 *
 * The observer is intentionally synchronous so authentic launch probes can
 * persist causality even when one guest lifecycle method monopolizes the event
 * loop. Runtime behavior remains unchanged when no observer is configured.
 *
 * @param {Function|null|undefined} observer Optional lifecycle progress sink.
 * @param {string} stage Stable machine-readable lifecycle stage.
 * @param {object} details Bounded guest-method or callback testimony.
 * @returns {boolean} True when the observer received this milestone.
 */
export function notifyActivityLifecycleProgress(observer, stage, details = {}) {
	if (observer === undefined || observer === null) return false;
	if (typeof observer !== "function") {
		throw lifecycleProgressError("ANDROID_ACTIVITY_PROGRESS_OBSERVER_INVALID");
	}
	observer(String(stage), Object.freeze({ ...details }));
	return true;
}

/** Creates one stable configuration error for an invalid lifecycle observer. */
function lifecycleProgressError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}