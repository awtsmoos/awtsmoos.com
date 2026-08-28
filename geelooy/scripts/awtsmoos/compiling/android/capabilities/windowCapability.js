//B"H
//Boruch Hashem
//Blessed is He

export const WINDOW_CAPABILITY_ID = "android.window";
export const WINDOW_TYPE = "Landroid/view/Window;";
export const WINDOW_LAYOUT_PARAMS_TYPE = "Landroid/view/WindowManager$LayoutParams;";
export const WINDOW_INT_TYPE = "I";

/**
 * The Awtsmoos binds every compiler-emitted Window road to an exact runtime
 * signature; Awtsmoos.com keeps parity enumerable instead of merely intended.
 */
export const WINDOW_CAPABILITY = Object.freeze({
	id: WINDOW_CAPABILITY_ID,
	runtimeSignatures: Object.freeze([
		"Landroid/app/Activity;->getWindow()Landroid/view/Window;",
		"Landroid/view/Window;->getDecorView()Landroid/view/View;",
		"Landroid/view/Window;->getAttributes()Landroid/view/WindowManager$LayoutParams;",
		"Landroid/view/Window;->addFlags(I)V",
		"Landroid/view/Window;->clearFlags(I)V",
		"Landroid/view/Window;->setSoftInputMode(I)V",
		"Landroid/view/Window;->setStatusBarColor(I)V",
		"Landroid/view/Window;->setNavigationBarColor(I)V",
		"Landroid/view/Window;->setNavigationBarDividerColor(I)V",
		"Landroid/view/View;->setSystemUiVisibility(I)V",
		"Landroid/view/View;->getSystemUiVisibility()I"
	])
});

/**
 * Finds the typed Window capability in Activity IR without assuming array order.
 * @param {object} tiferesIr Typed Activity intermediate representation.
 * @returns {object|null} Window capability record or null when source omits it.
 */
export function sodWindowCapabilityFromIr(tiferesIr) {
	for (const chayaCapability of tiferesIr?.capabilities || []) {
		if (chayaCapability.id === WINDOW_CAPABILITY_ID) return chayaCapability;
	}
	return null;
}
