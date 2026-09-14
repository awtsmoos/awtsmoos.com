//B"H
//Boruch Hashem
//Blessed be He

import {
	javaChoreographerInstance,
	postJavaChoreographerFrame,
	removeJavaChoreographerFrame,
	snapshotJavaChoreographer
} from "./frameworkAndroidChoreographerState.js";

const CHOREOGRAPHER = "Landroid/view/Choreographer;";

/**
 * Implements Java Choreographer without replacing guest frame execution.
 * Posting stores the real FrameCallback and defers its guest doFrame(long) method
 * until Flutter's root native lease is idle, allowing nativeOnVsync to occur through
 * the ordinary registered-native bridge instead of a synthetic host frame signal.
 *
 * @param {object} runtime Live Android runtime and Flutter session owner.
 * @returns {object} Framework family for android.view.Choreographer.
 */
export function createFrameworkAndroidChoreographerMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return record.method.classType === CHOREOGRAPHER;
		},
		invoke(record, args, dispatch, context) {
			const name = record.method.name;
			if (name === "getInstance") return javaChoreographerInstance(runtime);
			if (name === "postFrameCallback") {
				postJavaChoreographerFrame(runtime, context, args[1], 0);
				return undefined;
			}
			if (name === "postFrameCallbackDelayed") {
				postJavaChoreographerFrame(runtime, context, args[1], args[2]);
				return undefined;
			}
			if (name === "removeFrameCallback") {
				removeJavaChoreographerFrame(runtime, args[1]);
				return undefined;
			}
			throw choreographerError(
				"ANDROID_CHOREOGRAPHER_METHOD_UNSUPPORTED",
				record.signature
			);
		}
	});
}

/** Exposes bounded Java Choreographer queue testimony for diagnostics and tests. */
export function snapshotFrameworkAndroidChoreographer(runtime) {
	return snapshotJavaChoreographer(runtime);
}

function choreographerError(code, detail) {
	const error = new Error(`${code}:${detail ?? ""}`);
	error.code = code;
	return error;
}
