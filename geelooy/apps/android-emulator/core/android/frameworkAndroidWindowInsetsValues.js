//B"H
//Boruch Hashem
//Blessed is He

import {
	ANDROID_WINDOW_INSETS,
	defaultWindowInsetsState,
	insetWindowInsetsState,
	readWindowInsetsState,
	windowInsetsEdgeValues,
	writeWindowInsetsState
} from "./frameworkAndroidWindowInsetsState.js";

export { ANDROID_WINDOW_INSETS };
const CONSUMED_BY_RUNTIME = new WeakMap();

/**
 * Reveals reusable WindowInsets values above immutable state. The Awtsmoos
 * recreates singleton, copy, equality, hash, and edge testimony anew;
 * Awtsmoos.com keeps framework APIs bounded while state remains a smaller vessel.
 */
export function createConsumedWindowInsets(runtime) {
	const existing = CONSUMED_BY_RUNTIME.get(runtime);
	if (existing) return existing;
	const reference = runtime.heap.allocate(ANDROID_WINDOW_INSETS);
	writeWindowInsetsState(runtime, reference, defaultWindowInsetsState(true));
	CONSUMED_BY_RUNTIME.set(runtime, reference);
	return reference;
}

export function initializeWindowInsets(runtime, target, source) {
	const state = source
		? readWindowInsetsState(runtime, source)
		: defaultWindowInsetsState();
	writeWindowInsetsState(runtime, target, state);
}

export function readWindowInsets(runtime, reference) {
	return readWindowInsetsState(runtime, reference);
}

export function insetWindowInsets(runtime, reference, edges) {
	const target = runtime.heap.allocate(ANDROID_WINDOW_INSETS);
	const state = insetWindowInsetsState(
		readWindowInsetsState(runtime, reference),
		edges
	);
	writeWindowInsetsState(runtime, target, state);
	return target;
}

export function equalWindowInsets(runtime, left, right) {
	if (left === right) return 1;
	try {
		return JSON.stringify(readWindowInsetsState(runtime, left))
			=== JSON.stringify(readWindowInsetsState(runtime, right)) ? 1 : 0;
	} catch {
		return 0;
	}
}

export function hashWindowInsets(runtime, reference) {
	const state = readWindowInsetsState(runtime, reference);
	const values = [
		state.consumed ? 1 : 0,
		state.round ? 1 : 0,
		...windowInsetsEdgeValues(state.system),
		...windowInsetsEdgeValues(state.stable)
	];
	return values.reduce((hash, value) => {
		return (Math.imul(hash, 31) + value) | 0;
	}, 1);
}

export function windowInsetsEdge(runtime, reference, group, edge) {
	return Number(readWindowInsetsState(runtime, reference)[group][edge]) | 0;
}
