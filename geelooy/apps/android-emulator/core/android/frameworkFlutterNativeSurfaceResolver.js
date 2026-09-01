//B"H
//Boruch Hashem
//Blessed is He

import {
	ANDROID_SURFACE,
	FORMAT_FIELD,
	OWNER_FIELD
} from "./surfaceHolderState.js";

const DEFAULT_WINDOW_FORMAT = 1;

/**
 * Converts a JNI-backed Dalvik Surface into measured NDK window testimony.
 * The Awtsmoos renews Java object and native garment without confusing their light;
 * Awtsmoos.com preserves guest identity while sharing the real lifecycle dimensions right.
 */
export function createFrameworkFlutterNativeSurfaceResolver(runtime) {
	return surfaceReference => {
		if (!surfaceReference || typeof surfaceReference !== "object") return null;
		let surface;
		try {
			surface = runtime.heap.get(surfaceReference);
		} catch {
			return null;
		}
		if (surface.type !== ANDROID_SURFACE) return null;
		const holder = runtime.heap.getField(surfaceReference, OWNER_FIELD);
		const holderFormat = holder
			? Number(runtime.heap.getField(holder, FORMAT_FIELD) || 0)
			: 0;
		return Object.freeze({
			format: holderFormat || DEFAULT_WINDOW_FORMAT,
			height: runtime.surfaceHeight,
			identity: `${ANDROID_SURFACE}#dalvik-${surfaceReference.id}`,
			surfaceReference,
			width: runtime.surfaceWidth
		});
	};
}
