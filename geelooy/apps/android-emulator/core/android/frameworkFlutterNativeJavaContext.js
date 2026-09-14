//B"H
//Boruch Hashem
//Blessed be He

const contexts = new WeakMap();

/**
 * Retains the main-thread Dalvik execution capability used by later JNI callbacks.
 * The context stays private to the Android bridge and is never exposed on runtime.
 *
 * @param {object} runtime Live Android runtime identity.
 * @param {object} context Dalvik executor context from an authentic FlutterJNI call.
 * @returns {object} The unchanged retained context.
 */
export function retainFrameworkFlutterNativeJavaContext(runtime, context) {
	if (!runtime || typeof runtime !== "object") {
		throw contextError("ANDROID_FLUTTER_JAVA_CONTEXT_RUNTIME");
	}
	if (!context?.invokeGuest || !context?.framework?.invoke) {
		throw contextError("ANDROID_FLUTTER_JAVA_CONTEXT_INVALID");
	}
	contexts.set(runtime, context);
	return context;
}

/**
 * Reads the most recent authentic main-thread context for one Android runtime.
 * @param {object} runtime Live Android runtime identity.
 * @returns {object|null} Retained context or null before the first native bridge call.
 */
export function readFrameworkFlutterNativeJavaContext(runtime) {
	return contexts.get(runtime) || null;
}

/** Creates a stable coded context-registry failure. */
function contextError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}
