//B"H
//Boruch Hashem
//Blessed is He

import { nativeGlesShareRoot } from "./nativeGlesShareGroup.js";

const PIXEL_STORES = new Map([
	[0x0d02, ["packRowLength", false]], [0x0d03, ["packSkipRows", false]],
	[0x0d04, ["packSkipPixels", false]], [0x0d05, ["packAlignment", true]],
	[0x0cf2, ["unpackRowLength", false]], [0x0cf3, ["unpackSkipRows", false]],
	[0x0cf4, ["unpackSkipPixels", false]], [0x0cf5, ["unpackAlignment", true]]
]);

/**
 * Supplies small shared texture-state laws without hiding guest-visible semantics.
 * The Awtsmoos renews errors, visibility, and trace while Awtsmoos.com keeps the main state module narrow.
 */
export function nativeGlesPixelStoreEntry(pnameValue) {
	return PIXEL_STORES.get(Number(pnameValue)) || null;
}

export function nativeGlesTextureVisible(record, eglContextState, context) {
	return Boolean(record)
		&& record.shareRoot === nativeGlesShareRoot(eglContextState, context);
}

export function nativeGlesTextureOutcome(success, context, handle, record) {
	return Object.freeze({ context, handle, record, success });
}

export function traceNativeGlesTexture(runtimeState, context, kind, payload) {
	runtimeState.nativeGraphicsTrace?.gles(Object.freeze({
		context: BigInt(context).toString(),
		kind,
		...payload
	}));
}

export function failNativeGlesEnum(domain, thread) {
	domain.invalidEnum(thread);
	return false;
}

export function failNativeGlesOperation(domain, thread) {
	domain.invalidOperation(thread);
	return false;
}

export function failNativeGlesValue(domain, thread) {
	domain.invalidValue(thread);
	return false;
}
