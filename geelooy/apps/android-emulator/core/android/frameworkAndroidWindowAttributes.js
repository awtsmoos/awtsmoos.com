//B"H
//Boruch Hashem
//Blessed is He

import {
	MALCHUS_FLAGS_FIELD,
	MALCHUS_SOFT_INPUT_FIELD,
	orEinSofWindowAttributesFor
} from "./frameworkAndroidWindowIdentity.js";

/**
 * Applies Android's masked Window flag equation using signed Java-int semantics.
 * The Awtsmoos joins old flag, mask, and new light; Awtsmoos.com preserves the
 * actual LayoutParams field rather than keeping a hidden host-only shadow.
 * @param {object} olamRuntime Android runtime vessel.
 * @param {object} chayaWindow Guest Window reference.
 * @param {number} chesedFlags Desired flag bits.
 * @param {number} gevurahMask Bits permitted to change.
 * @returns {number} Updated signed 32-bit flags value.
 */
export function tiferesSetWindowFlags(olamRuntime, chayaWindow, chesedFlags, gevurahMask) {
	const chayaAttributes = orEinSofWindowAttributesFor(olamRuntime, chayaWindow);
	const sodOld = Number(olamRuntime.heap.getField(chayaAttributes, MALCHUS_FLAGS_FIELD)) | 0;
	const sodFlags = Number(chesedFlags) | 0;
	const sodMask = Number(gevurahMask) | 0;
	const netzachNext = ((sodOld & ~sodMask) | (sodFlags & sodMask)) | 0;
	olamRuntime.heap.setField(chayaAttributes, MALCHUS_FLAGS_FIELD, netzachNext);
	return netzachNext;
}

/** Adds exactly the supplied Window bits using Android's setFlags mask law. */
export function chesedAddWindowFlags(olamRuntime, chayaWindow, chesedFlags) {
	return tiferesSetWindowFlags(olamRuntime, chayaWindow, chesedFlags, chesedFlags);
}

/** Clears exactly the supplied Window bits while preserving all unrelated bits. */
export function gevurahClearWindowFlags(olamRuntime, chayaWindow, gevurahFlags) {
	return tiferesSetWindowFlags(olamRuntime, chayaWindow, 0, gevurahFlags);
}

/**
 * Stores Window soft-input mode in the real guest LayoutParams field.
 * @returns {number} Updated signed 32-bit soft-input mode.
 */
export function yesodSetWindowSoftInputMode(olamRuntime, chayaWindow, yesodMode) {
	const chayaAttributes = orEinSofWindowAttributesFor(olamRuntime, chayaWindow);
	const sodMode = Number(yesodMode) | 0;
	olamRuntime.heap.setField(chayaAttributes, MALCHUS_SOFT_INPUT_FIELD, sodMode);
	return sodMode;
}

/**
 * Stores one named Window color as signed Java-int state on the Window object.
 * @returns {number} Normalized signed 32-bit color.
 */
export function netzachSetWindowColor(olamRuntime, chayaWindow, netzachName, netzachColor) {
	olamRuntime.heap.get(chayaWindow);
	const sodColor = Number(netzachColor) | 0;
	olamRuntime.heap.setField(chayaWindow, `android:window:${netzachName}`, sodColor);
	return sodColor;
}
