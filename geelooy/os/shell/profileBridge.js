//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module OsProfileBridge
 * @description
 * The Awtsmoos lets Geelooy OS borrow the one living Awtsmoos.com profile instrument;
 * one bridge owns mount and refresh so vanished compatibility files can never break boot again.
 */

import createProfileDropdown from "/scripts/awtsmoos/social/profileDropdown.js";

/** Mounts the shared profile instrument into an explicit OS holder. */
export async function renderProfileDropdown(holder) {
	if (!(holder instanceof HTMLElement)) {
		return null;
	}
	return createProfileDropdown(holder);
}

/** Refreshes the OS profile holder after authentication-sensitive actions. */
export async function refreshProfileDropdown() {
	const holder = document.getElementById("loginHolder");
	if (!holder) {
		return null;
	}
	return createProfileDropdown(holder);
}
