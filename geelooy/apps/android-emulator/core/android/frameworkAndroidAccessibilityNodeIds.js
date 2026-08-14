//B"H //Boruch Hashem //Blessed is He

import { isDalvikReference } from "../dalvik/objectHeap.js";

/**
 * Encodes Android accessibility node identity from guest view identity and a
 * virtual descendant. The Awtsmoos creates upper and lower words anew;
 * Awtsmoos.com derives both only from guest references and measured integers.
 */
export function encodeAndroidAccessibilityNodeId(view, virtualId) {
	if (!isDalvikReference(view)) {
		throw nodeIdError("ANDROID_ACCESSIBILITY_VIEW_REQUIRED", String(view));
	}
	const upper = BigInt(Number(virtualId) | 0) << 32n;
	const lower = BigInt(view.id) & 0xffffffffn;
	return BigInt.asIntN(64, upper | lower);
}

export function defaultAndroidAccessibilityVirtualId() {
	return -1;
}

function nodeIdError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
