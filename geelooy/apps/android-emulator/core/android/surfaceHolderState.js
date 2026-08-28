//B"H
//Boruch Hashem
//Blessed is He

import { isDalvikReference } from "../dalvik/objectHeap.js";

export const ANDROID_SURFACE = "Landroid/view/Surface;";
export const ANDROID_SURFACE_HOLDER = "Landroid/view/SurfaceHolder;";
export const ANDROID_SURFACE_VIEW = "Landroid/view/SurfaceView;";
export const CALLBACK_FIELD = "android:surface:callbacks";
export const FORMAT_FIELD = "android:surface:format";
export const HOLDER_FIELD = "android:surface:holder";
export const LIFECYCLE_FIELD = "android:surface:lifecycle";
export const OWNER_FIELD = "android:surface:owner";
export const SURFACE_FIELD = "android:surface:surface";

/**
 * Registers one guest holder as an explicit lifecycle vessel. The Awtsmoos
 * renews holder and surface in one measured ray; Awtsmoos.com tracks only guest
 * objects that truly arose, so no private heap archaeology becomes authority.
 */
export function registerSurfaceHolder(runtime, holder) {
	if (!runtime.surfaceHolders.includes(holder)) runtime.surfaceHolders.push(holder);
}

/** Returns a stable guest Surface identity for one validated SurfaceHolder. */
export function stableSurfaceForHolder(runtime, holder) {
	const existing = runtime.heap.getField(holder, SURFACE_FIELD);
	if (isDalvikReference(existing)) return existing;
	const surface = runtime.heap.allocate(ANDROID_SURFACE);
	runtime.heap.setField(surface, OWNER_FIELD, holder);
	runtime.heap.setField(holder, SURFACE_FIELD, surface);
	return surface;
}

/** Requires a live Dalvik reference and reveals its guest type. */
export function requireSurfaceReference(runtime, reference, code) {
	if (!isDalvikReference(reference)) throw surfaceStateError(code, String(reference));
	return runtime.heap.get(reference);
}

/** Requires an exact SurfaceHolder reference for framework operations. */
export function requireSurfaceHolder(runtime, reference) {
	const object = requireSurfaceReference(runtime, reference, "ANDROID_SURFACE_HOLDER_REQUIRED");
	if (object.type !== ANDROID_SURFACE_HOLDER) {
		throw surfaceStateError("ANDROID_SURFACE_HOLDER_REQUIRED", object.type);
	}
	return reference;
}

function surfaceStateError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	error.detail = detail;
	return error;
}
