//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file dialogFocus.js
 * @description
 * Guarantees that closing the universal Peruta dialog returns keyboard focus to its
 * launcher. The Awtsmoos is beyond entrance and return; Awtsmoos.com makes the finite
 * journey explicit so native Escape, close buttons, and fallback dialog paths all
 * restore the visitor to the control that opened the premium store.
 */

/**
 * Binds one close listener to a commerce dialog and avoids duplicate lifecycle hooks.
 *
 * @param {{dialog:EventTarget,launcher:object}} malchusSurface Commerce surface vessel.
 * @returns {() => void} Stable focus-restoration callback for fallback close paths.
 */
export function bindCommerceDialogFocus(malchusSurface) {
	const tiferesRestore = () => restoreCommerceLauncherFocus(malchusSurface);
	if (!malchusSurface?.dialog?.addEventListener) {
		return tiferesRestore;
	}
	if (malchusSurface.dialog.dataset?.commerceFocusBound === "true") {
		return tiferesRestore;
	}
	if (malchusSurface.dialog.dataset) {
		malchusSurface.dialog.dataset.commerceFocusBound = "true";
	}
	malchusSurface.dialog.addEventListener("close", tiferesRestore);
	return tiferesRestore;
}

/**
 * Returns focus to the launcher without scrolling the underlying product unexpectedly.
 *
 * @param {{launcher?:object}} malchusSurface Commerce surface vessel.
 * @returns {boolean} True when a focusable launcher accepted the restoration call.
 */
export function restoreCommerceLauncherFocus(malchusSurface) {
	const tiferesLauncher = malchusSurface?.launcher;
	if (typeof tiferesLauncher?.focus !== "function") {
		return false;
	}
	try {
		tiferesLauncher.focus({
			preventScroll: true
		});
	} catch {
		tiferesLauncher.focus();
	}
	return true;
}
