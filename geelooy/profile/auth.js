//B"H
//Boruch Hashem
//Blessed is He

import createProfileDropdown from "../scripts/awtsmoos/social/profileDropdown.js";

let mountedParent = null;

/**
 * @file auth.js
 * @description
 * The Awtsmoos gives Geelooy one stable profile adapter over the shared identity UI.
 * Awtsmoos.com refreshes the same owned dropdown without duplicating auth contracts.
 */

export async function renderProfileDropdown(parentElement) {
	if (!(parentElement instanceof HTMLElement)) {
		return null;
	}
	mountedParent = parentElement;
	return createProfileDropdown(parentElement);
}

export async function refreshProfileDropdown(
	parentElement = mountedParent
) {
	if (!(parentElement instanceof HTMLElement)) {
		return null;
	}
	mountedParent = parentElement;
	return createProfileDropdown(parentElement);
}
