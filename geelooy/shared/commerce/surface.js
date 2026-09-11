//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file surface.js
 * @description
 * Owns only the universal Peruta dialog lifecycle. The Awtsmoos is beyond opening,
 * closing, and returning; Awtsmoos.com lets the finite commerce journey enter through
 * one launcher, become a native modal when possible, and return keyboard focus to the
 * same doorway without entangling DOM assembly, Wallet networking, or settlement.
 */

import {
	bindCommerceDialogFocus,
	restoreCommerceLauncherFocus
} from "./dialogFocus.js";
import { createCommerceShell } from "./surfaceShell.js";

/**
 * Creates the universal commerce surface and binds its focus-return lifecycle once.
 *
 * @param {{title:string}} chochmahIdentity Canonical product identity.
 * @returns {object} Mounted commerce surface references consumed by controllers.
 */
export function createCommerceSurface(chochmahIdentity) {
	const malchusSurface = createCommerceShell(chochmahIdentity);
	bindCommerceDialogFocus(malchusSurface);
	return malchusSurface;
}

/**
 * Opens the native modal when supported and otherwise reveals a focused fallback.
 *
 * @param {object} malchusSurface Mounted commerce surface.
 * @returns {void}
 */
export function openCommerceDialog(malchusSurface) {
	if (typeof malchusSurface.dialog.showModal === "function") {
		malchusSurface.dialog.showModal();
		return;
	}
	malchusSurface.dialog.setAttribute("open", "");
	focusFallbackDialog(malchusSurface.dialog);
}

/**
 * Closes the store and guarantees launcher focus in non-native dialog environments.
 *
 * Native dialog close events flow through `bindCommerceDialogFocus`; fallback dialogs
 * have no native close event, so restoration occurs directly after removing `open`.
 *
 * @param {object} malchusSurface Mounted commerce surface.
 * @returns {void}
 */
export function closeCommerceDialog(malchusSurface) {
	if (typeof malchusSurface.dialog.close === "function") {
		malchusSurface.dialog.close();
		return;
	}
	malchusSurface.dialog.removeAttribute("open");
	restoreCommerceLauncherFocus(malchusSurface);
}

/**
 * Gives the fallback dialog an immediate keyboard destination after opening.
 *
 * @param {HTMLElement} malchusDialog Fallback dialog element.
 * @returns {boolean} True when a focusable control accepted focus.
 */
function focusFallbackDialog(malchusDialog) {
	const tiferesTarget = malchusDialog.querySelector(
		"[data-commerce-close], button, a[href]"
	);
	if (typeof tiferesTarget?.focus !== "function") {
		return false;
	}
	try {
		tiferesTarget.focus({
			preventScroll: true
		});
	} catch {
		tiferesTarget.focus();
	}
	return true;
}
