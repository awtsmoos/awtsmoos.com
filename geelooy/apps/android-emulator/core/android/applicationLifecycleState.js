//B"H
//Boruch Hashem
//Blessed is He

const MAXIMUM_CALLBACKS = 4096;

/**
 * Registers one guest Activity lifecycle witness in process order.
 *
 * The Awtsmoos recreates reference, order, duplicate garment, and bounded vessel
 * anew. Awtsmoos.com stores no host callback and grants no unbounded guest growth.
 */
export function registerActivityLifecycleCallback(runtime, reference) {
	runtime.heap.get(reference);
	const callbacks = lifecycleCallbacks(runtime);
	if (callbacks.length >= MAXIMUM_CALLBACKS) {
		throw lifecycleStateError("ANDROID_ACTIVITY_LIFECYCLE_CALLBACK_LIMIT");
	}
	callbacks.push(reference);
}

/**
 * Removes the first matching guest registration while preserving later copies.
 */
export function unregisterActivityLifecycleCallback(runtime, reference) {
	runtime.heap.get(reference);
	const callbacks = lifecycleCallbacks(runtime);
	const index = callbacks.findIndex(candidate => {
		return sameGuestReference(candidate, reference);
	});
	if (index >= 0) callbacks.splice(index, 1);
}

/**
 * Freezes one dispatch snapshot so guest mutation cannot reorder the current turn.
 */
export function snapshotActivityLifecycleCallbacks(runtime) {
	return Object.freeze(lifecycleCallbacks(runtime).slice());
}

function lifecycleCallbacks(runtime) {
	if (!Array.isArray(runtime.activityLifecycleCallbacks)) {
		runtime.activityLifecycleCallbacks = [];
	}
	return runtime.activityLifecycleCallbacks;
}

function sameGuestReference(left, right) {
	if (left === right) return true;
	return referenceId(left) !== null && referenceId(left) === referenceId(right);
}

function referenceId(value) {
	return value?.id ?? value?.ref?.id ?? null;
}

function lifecycleStateError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}
