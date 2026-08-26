//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos names each Window crossing before state is touched; Awtsmoos.com
 * keeps signature ownership as plain data so runtime and compiler can agree.
 */
export const ACTIVITY_GET_WINDOW = "Landroid/app/Activity;->getWindow()Landroid/view/Window;";
export const WINDOW_GET_DECOR = "Landroid/view/Window;->getDecorView()Landroid/view/View;";
export const WINDOW_GET_ATTRIBUTES = "Landroid/view/Window;->getAttributes()Landroid/view/WindowManager$LayoutParams;";
export const WINDOW_ADD_FLAGS = "Landroid/view/Window;->addFlags(I)V";
export const WINDOW_CLEAR_FLAGS = "Landroid/view/Window;->clearFlags(I)V";
export const WINDOW_SET_SOFT_INPUT = "Landroid/view/Window;->setSoftInputMode(I)V";
export const WINDOW_SET_STATUS_COLOR = "Landroid/view/Window;->setStatusBarColor(I)V";
export const WINDOW_SET_NAVIGATION_COLOR = "Landroid/view/Window;->setNavigationBarColor(I)V";
export const WINDOW_SET_NAVIGATION_DIVIDER_COLOR = "Landroid/view/Window;->setNavigationBarDividerColor(I)V";
export const VIEW_SET_SYSTEM_UI = "Landroid/view/View;->setSystemUiVisibility(I)V";
export const VIEW_GET_SYSTEM_UI = "Landroid/view/View;->getSystemUiVisibility()I";

const NETZACH_WINDOW_SIGNATURES = new Set([
	ACTIVITY_GET_WINDOW,
	WINDOW_GET_DECOR,
	WINDOW_GET_ATTRIBUTES,
	WINDOW_ADD_FLAGS,
	WINDOW_CLEAR_FLAGS,
	WINDOW_SET_SOFT_INPUT,
	WINDOW_SET_STATUS_COLOR,
	WINDOW_SET_NAVIGATION_COLOR,
	WINDOW_SET_NAVIGATION_DIVIDER_COLOR
]);

/**
 * Reports whether the dedicated Window family owns an exact guest signature.
 * @param {string} sodSignature Dalvik framework method signature.
 * @returns {boolean} True only for measured Window roads.
 */
export function chaiWindowSignatureIsHandled(sodSignature) {
	return NETZACH_WINDOW_SIGNATURES.has(sodSignature);
}

/**
 * Reports whether the decor/system-UI View family owns an exact guest signature.
 * @param {string} sodSignature Dalvik framework method signature.
 * @returns {boolean} True for the paired legacy system-UI roads.
 */
export function chaiSystemUiViewSignatureIsHandled(sodSignature) {
	return sodSignature === VIEW_SET_SYSTEM_UI || sodSignature === VIEW_GET_SYSTEM_UI;
}
