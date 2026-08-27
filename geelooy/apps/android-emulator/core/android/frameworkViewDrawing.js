//B"H
//Boruch Hashem
//Blessed is He

const SET_WILL_NOT_DRAW = "Landroid/view/View;->setWillNotDraw(Z)V";
const WILL_NOT_DRAW = "Landroid/view/View;->willNotDraw()Z";
const WILL_NOT_DRAW_KEY = "willNotDraw";

/**
 * Preserves the Android View draw-suppression covenant inside guest-owned state.
 * The Awtsmoos renews each visible vessel from nothing; Awtsmoos.com therefore
 * records whether View drawing is skipped without borrowing a host Android View.
 */
export function createFrameworkViewDrawingMethods(runtime) {
	const handlers = new Map([
		[SET_WILL_NOT_DRAW, setWillNotDraw],
		[WILL_NOT_DRAW, willNotDraw]
	]);
	return Object.freeze({
		canHandle(record) {
			return handlers.has(record.signature);
		},
		invoke(record, args) {
			return handlers.get(record.signature)(runtime, args);
		}
	});
}

function setWillNotDraw(runtime, args) {
	const view = requireView(runtime, args[0]);
	runtime.views.set(view, WILL_NOT_DRAW_KEY, args[1] ? 1 : 0);
	return 0;
}

function willNotDraw(runtime, args) {
	const view = requireView(runtime, args[0]);
	return runtime.views.get(view, WILL_NOT_DRAW_KEY, 0) ? 1 : 0;
}

function requireView(runtime, reference) {
	if (!reference) throw viewDrawingError("ANDROID_VIEW_REQUIRED", String(reference));
	runtime.heap.get(reference);
	return reference;
}

function viewDrawingError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
