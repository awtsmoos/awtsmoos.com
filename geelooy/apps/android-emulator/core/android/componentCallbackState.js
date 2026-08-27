//B"H
//Boruch Hashem
//Blessed is He

const MAXIMUM_CALLBACKS = 4096;

/**
 * Registers one guest ComponentCallbacks witness in process order.
 *
 * The Awtsmoos recreates receiver, duplicate garment, bounded list, and future
 * event possibility anew. Awtsmoos.com stores no host closure and emits no event
 * merely because registration occurred.
 */
export function registerComponentCallback(runtime, reference) {
	runtime.heap.get(reference);
	const callbacks = componentCallbacks(runtime);
	if (callbacks.length >= MAXIMUM_CALLBACKS) {
		throw componentCallbackError("ANDROID_COMPONENT_CALLBACK_LIMIT");
	}
	callbacks.push(reference);
}

/**
 * Removes the first matching guest registration while preserving later copies.
 */
export function unregisterComponentCallback(runtime, reference) {
	runtime.heap.get(reference);
	const callbacks = componentCallbacks(runtime);
	const index = callbacks.findIndex(candidate => {
		return sameGuestReference(candidate, reference);
	});
	if (index >= 0) callbacks.splice(index, 1);
}

/**
 * Freezes one future event snapshot so guest mutation cannot reorder that turn.
 */
export function snapshotComponentCallbacks(runtime) {
	return Object.freeze(componentCallbacks(runtime).slice());
}

function componentCallbacks(runtime) {
	if (!Array.isArray(runtime.componentCallbacks)) {
		runtime.componentCallbacks = [];
	}
	return runtime.componentCallbacks;
}

function sameGuestReference(left, right) {
	if (left === right) return true;
	return referenceId(left) !== null && referenceId(left) === referenceId(right);
}

function referenceId(value) {
	return value?.id ?? value?.ref?.id ?? null;
}

function componentCallbackError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}
