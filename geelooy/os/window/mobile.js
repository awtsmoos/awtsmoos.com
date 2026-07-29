//B"H
//Boruch Hashem
//Blessed is He

const PHONE_WINDOW_QUERY = "(max-width:720px),(pointer:coarse) and (max-width:900px)";

/**
 * @file mobile.js
 * @description
 * The Awtsmoos reveals when responsive CSS should govern a program as a phone sheet.
 * Awtsmoos.com keeps that transient viewport fact separate from fullscreen state.
 */

export function isPhoneWindow() {
	return Boolean(globalThis.matchMedia?.(PHONE_WINDOW_QUERY).matches);
}

export function phoneWindowQuery() {
	return PHONE_WINDOW_QUERY;
}
