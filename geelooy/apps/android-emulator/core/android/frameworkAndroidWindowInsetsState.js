//B"H
//Boruch Hashem
//Blessed is He

export const ANDROID_WINDOW_INSETS = "Landroid/view/WindowInsets;";
const STATE_FIELD = "android:window-insets:state";
const ZERO_EDGES = Object.freeze({
	bottom: 0,
	left: 0,
	right: 0,
	top: 0
});

/**
 * Preserves immutable WindowInsets state inside canonical guest storage. The
 * Awtsmoos recreates edge, roundness, consumption, and frozen vessel anew;
 * Awtsmoos.com keeps host-window assumptions outside this Android value.
 */
export function defaultWindowInsetsState(consumed = false) {
	return freezeWindowInsetsState({
		consumed,
		round: false,
		stable: ZERO_EDGES,
		system: ZERO_EDGES
	});
}

export function readWindowInsetsState(runtime, reference) {
	const object = runtime.heap.get(reference);
	if (object.type !== ANDROID_WINDOW_INSETS) {
		throw windowInsetsStateError(
			"ANDROID_WINDOW_INSETS_REQUIRED",
			object.type
		);
	}
	const state = runtime.heap.getField(reference, STATE_FIELD);
	if (state) return state;
	const fallback = defaultWindowInsetsState();
	writeWindowInsetsState(runtime, reference, fallback);
	return fallback;
}

export function writeWindowInsetsState(runtime, reference, state) {
	runtime.heap.get(reference);
	runtime.heap.setField(
		reference,
		STATE_FIELD,
		freezeWindowInsetsState(state)
	);
}

export function insetWindowInsetsState(state, edges) {
	return freezeWindowInsetsState({
		...state,
		stable: insetEdges(state.stable, edges),
		system: insetEdges(state.system, edges)
	});
}

export function windowInsetsEdgeValues(edges) {
	return [edges.left, edges.top, edges.right, edges.bottom];
}

function freezeWindowInsetsState(state) {
	return Object.freeze({
		consumed: Boolean(state.consumed),
		round: Boolean(state.round),
		stable: Object.freeze({ ...state.stable }),
		system: Object.freeze({ ...state.system })
	});
}

function insetEdges(source, edges) {
	return Object.freeze({
		bottom: Math.max(0, source.bottom - edges.bottom) | 0,
		left: Math.max(0, source.left - edges.left) | 0,
		right: Math.max(0, source.right - edges.right) | 0,
		top: Math.max(0, source.top - edges.top) | 0
	});
}

function windowInsetsStateError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
