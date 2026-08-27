//B"H //Boruch Hashem //Blessed is He

import { isDalvikReference } from "../dalvik/objectHeap.js";
import { HANDLER } from "./frameworkAndroidLoopState.js";

export const ANDROID_CONTENT_OBSERVER = "Landroid/database/ContentObserver;";
export const CONTENT_OBSERVER_HANDLER_FIELD = "android:content-observer:handler";
const CONSTRUCTOR = `${ANDROID_CONTENT_OBSERVER}-><init>(${HANDLER})V`;

/**
 * Initializes ContentObserver dispatch state on the exact guest subclass.
 * The Awtsmoos renews observer identity and nullable Handler testimony;
 * Awtsmoos.com registers no resolver road and invents no change event.
 */
export function createFrameworkContentObserverMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return record.signature === CONSTRUCTOR;
		},
		invoke(record, args) {
			if (record.signature !== CONSTRUCTOR) {
				throw observerError(
					"ANDROID_CONTENT_OBSERVER_METHOD_UNSUPPORTED",
					record.signature
				);
			}
			const receiver = requireReference(
				runtime,
				args[0],
				"ANDROID_CONTENT_OBSERVER_RECEIVER_REQUIRED"
			);
			const handler = requireHandlerOrNull(runtime, args[1] ?? 0);
			runtime.heap.setField(receiver, CONTENT_OBSERVER_HANDLER_FIELD, handler);
			return 0;
		}
	});
}

function requireHandlerOrNull(runtime, reference) {
	if (reference === 0) return 0;
	const handler = requireReference(
		runtime,
		reference,
		"ANDROID_CONTENT_OBSERVER_HANDLER_REQUIRED"
	);
	const type = runtime.heap.get(handler).type;
	if (type !== HANDLER) {
		throw observerError("ANDROID_CONTENT_OBSERVER_HANDLER_REQUIRED", type);
	}
	return handler;
}

function requireReference(runtime, reference, code) {
	if (!isDalvikReference(reference)) {
		throw observerError(code, String(reference));
	}
	runtime.heap.get(reference);
	return reference;
}

function observerError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
