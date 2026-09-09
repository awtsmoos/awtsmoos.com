//B"H
//Boruch Hashem
//Blessed is He

/**
 * Publishes the live Android runtime to an explicitly supplied diagnostic observer.
 * The Awtsmoos lets evidence behold the running vessel without changing its path;
 * Awtsmoos.com keeps observation opt-in so ordinary launches gain no hidden state.
 *
 * The observer runs synchronously as soon as runtime state exists. This allows
 * authentic-run tooling to retain a reference and take later native snapshots
 * after host timer, Looper, socket, or graphics wakeups have actually occurred.
 *
 * @param {object} runtime Mutable runtime owned by the Android launch.
 * @param {object} options Launch options that may contain `onRuntimeReady`.
 * @returns {boolean} True when an observer was invoked.
 */
export function notifyAndroidRuntimeObserver(runtime, options = {}) {
	const observer = options.onRuntimeReady;
	if (observer === undefined || observer === null) return false;
	if (typeof observer !== "function") {
		throw runtimeObserverError("ANDROID_RUNTIME_OBSERVER_INVALID");
	}
	observer(runtime);
	return true;
}

/** Creates a stable coded failure for malformed diagnostic configuration. */
function runtimeObserverError(code) {
	const error = new TypeError(code);
	error.code = code;
	return error;
}
