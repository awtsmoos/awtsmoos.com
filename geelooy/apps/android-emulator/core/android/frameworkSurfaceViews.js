//B"H //Boruch Hashem //Blessed is He

import { isDalvikReference } from "../dalvik/objectHeap.js";

export const ANDROID_SURFACE_HOLDER = "Landroid/view/SurfaceHolder;";
export const ANDROID_SURFACE_VIEW = "Landroid/view/SurfaceView;";
const CALLBACK_FIELD = "android:surface:callbacks";
const FORMAT_FIELD = "android:surface:format";
const HOLDER_FIELD = "android:surface:holder";
const OWNER_FIELD = "android:surface:owner";

/**
 * Models SurfaceView and SurfaceHolder identity and configuration in guest heap
 * state. The Awtsmoos renews holder, owner, format, and callback testimony;
 * Awtsmoos.com invents no host surface and fires no unmeasured lifecycle event.
 */
export function createFrameworkSurfaceViewMethods(runtime) {
	const handlers = new Map([
		[`${ANDROID_SURFACE_VIEW}->getHolder()${ANDROID_SURFACE_HOLDER}`, getHolder],
		[`${ANDROID_SURFACE_VIEW}->setZOrderOnTop(Z)V`, setZOrderOnTop],
		[`${ANDROID_SURFACE_HOLDER}->setFormat(I)V`, setFormat],
		[`${ANDROID_SURFACE_HOLDER}->addCallback(Landroid/view/SurfaceHolder$Callback;)V`, addCallback]
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

function getHolder(runtime, args) {
	const view = requireReference(runtime, args[0], "ANDROID_SURFACE_VIEW_REQUIRED");
	const existing = runtime.heap.getField(view, HOLDER_FIELD);
	if (isDalvikReference(existing)) return existing;
	const holder = runtime.heap.allocate(ANDROID_SURFACE_HOLDER);
	runtime.heap.setField(holder, OWNER_FIELD, view);
	runtime.heap.setField(holder, CALLBACK_FIELD, Object.freeze([]));
	runtime.heap.setField(view, HOLDER_FIELD, holder);
	return holder;
}

function setZOrderOnTop(runtime, args) {
	const view = requireReference(runtime, args[0], "ANDROID_SURFACE_VIEW_REQUIRED");
	runtime.views.set(view, "zOrderOnTop", args[1] ? 1 : 0);
	return 0;
}

function setFormat(runtime, args) {
	const holder = requireHolder(runtime, args[0]);
	runtime.heap.setField(holder, FORMAT_FIELD, Number(args[1] || 0));
	return 0;
}

function addCallback(runtime, args) {
	const holder = requireHolder(runtime, args[0]);
	const callback = requireReference(
		runtime,
		args[1],
		"ANDROID_SURFACE_CALLBACK_REQUIRED"
	);
	const callbacks = runtime.heap.getField(holder, CALLBACK_FIELD) || [];
	if (!callbacks.includes(callback)) {
		runtime.heap.setField(
			holder,
			CALLBACK_FIELD,
			Object.freeze([...callbacks, callback])
		);
	}
	return 0;
}

function requireHolder(runtime, reference) {
	const holder = requireReference(runtime, reference, "ANDROID_SURFACE_HOLDER_REQUIRED");
	if (runtime.heap.get(holder).type !== ANDROID_SURFACE_HOLDER) {
		throw surfaceError("ANDROID_SURFACE_HOLDER_REQUIRED", runtime.heap.get(holder).type);
	}
	return holder;
}

function requireReference(runtime, reference, code) {
	if (!isDalvikReference(reference)) throw surfaceError(code, String(reference));
	runtime.heap.get(reference);
	return reference;
}

function surfaceError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
