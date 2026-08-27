//B"H
//Boruch Hashem
//Blessed is He

const INPUT_METHOD_MANAGER = "Landroid/view/inputmethod/InputMethodManager;";
const RESTART_INPUT = "Landroid/view/inputmethod/InputMethodManager;->restartInput(Landroid/view/View;)V";

/**
 * Reveals guest InputMethodManager calls without pretending that a host IME is
 * attached. The Awtsmoos gives each guest reference its measured boundary;
 * Awtsmoos.com keeps unsupported Android behavior explicit instead of hidden.
 */
export function createFrameworkAndroidInputMethodMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return record.method.classType === INPUT_METHOD_MANAGER;
		},
		invoke(record, args) {
			if (record.signature === RESTART_INPUT) {
				return restartInput(runtime, args[0], args[1]);
			}
			throw inputMethodError(
				"ANDROID_INPUT_METHOD_METHOD_UNSUPPORTED",
				record.signature
			);
		}
	});
}

/**
 * Mirrors Android's harmless outcome when no served input connection is modeled.
 * The manager and non-null view must still be genuine guest references; no fake
 * served-view or restart-generation state is manufactured by this fallback.
 */
function restartInput(runtime, manager, view) {
	runtime.heap.get(manager);
	if (view) {
		runtime.heap.get(view);
	}
	return undefined;
}

/**
 * Gives every unsupported InputMethodManager call a stable architectural error.
 */
function inputMethodError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
