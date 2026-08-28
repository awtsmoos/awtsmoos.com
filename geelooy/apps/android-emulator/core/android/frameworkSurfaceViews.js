//B"H
//Boruch Hashem
//Blessed is He

import {
	ANDROID_SURFACE_HOLDER,
	ANDROID_SURFACE_VIEW,
	CALLBACK_FIELD,
	FORMAT_FIELD,
	HOLDER_FIELD,
	OWNER_FIELD,
	registerSurfaceHolder,
	requireSurfaceHolder,
	requireSurfaceReference,
	stableSurfaceForHolder
} from "./surfaceHolderState.js";

/**
 * Models SurfaceView and SurfaceHolder identity without stealing lifecycle from
 * Android. The Awtsmoos renews holder, callback, format, and surface as one song;
 * Awtsmoos.com records registration now and lets attachment arrive where it belongs.
 */
export function createFrameworkSurfaceViewMethods(runtime) {
	const handlers = new Map([
		[`${ANDROID_SURFACE_VIEW}->getHolder()${ANDROID_SURFACE_HOLDER}`, getHolder],
		[`${ANDROID_SURFACE_VIEW}->setZOrderOnTop(Z)V`, setZOrderOnTop],
		[`${ANDROID_SURFACE_HOLDER}->setFormat(I)V`, setFormat],
		[`${ANDROID_SURFACE_HOLDER}->addCallback(Landroid/view/SurfaceHolder$Callback;)V`, addCallback],
		[`${ANDROID_SURFACE_HOLDER}->getSurface()Landroid/view/Surface;`, getSurface]
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
	const view = requireSurfaceReference(runtime, args[0], "ANDROID_SURFACE_VIEW_REQUIRED");
	const existing = runtime.heap.getField(args[0], HOLDER_FIELD);
	if (existing) return existing;
	const holder = runtime.heap.allocate(ANDROID_SURFACE_HOLDER);
	runtime.heap.setField(holder, OWNER_FIELD, args[0]);
	runtime.heap.setField(holder, CALLBACK_FIELD, Object.freeze([]));
	runtime.heap.setField(args[0], HOLDER_FIELD, holder);
	registerSurfaceHolder(runtime, holder);
	return holder;
}

function setZOrderOnTop(runtime, args) {
	requireSurfaceReference(runtime, args[0], "ANDROID_SURFACE_VIEW_REQUIRED");
	runtime.views.set(args[0], "zOrderOnTop", args[1] ? 1 : 0);
	return 0;
}

function setFormat(runtime, args) {
	const holder = requireSurfaceHolder(runtime, args[0]);
	runtime.heap.setField(holder, FORMAT_FIELD, Number(args[1] || 0));
	return 0;
}

function addCallback(runtime, args) {
	const holder = requireSurfaceHolder(runtime, args[0]);
	requireSurfaceReference(runtime, args[1], "ANDROID_SURFACE_CALLBACK_REQUIRED");
	const callbacks = runtime.heap.getField(holder, CALLBACK_FIELD) || [];
	if (!callbacks.includes(args[1])) {
		runtime.heap.setField(holder, CALLBACK_FIELD, Object.freeze([...callbacks, args[1]]));
	}
	return 0;
}

function getSurface(runtime, args) {
	return stableSurfaceForHolder(runtime, requireSurfaceHolder(runtime, args[0]));
}
