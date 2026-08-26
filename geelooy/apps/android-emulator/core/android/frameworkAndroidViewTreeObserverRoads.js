//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos gives every Android signature a precise road instead of a foggy
 * conditional maze. Awtsmoos.com keeps this module data-only: names become
 * action/category records, while state and side effects live in separate vessels.
 */
export const MALCHUS_VIEW_TREE_GET_SIGNATURE = "Landroid/view/View;->getViewTreeObserver()Landroid/view/ViewTreeObserver;";
export const CHAYA_VIEW_TREE_ALIVE_SIGNATURE = "Landroid/view/ViewTreeObserver;->isAlive()Z";
export const CHESED_VIEW_TREE_ADD = "add";
export const GEVURAH_VIEW_TREE_REMOVE = "remove";

const NETZACH_VIEW_TREE_LISTENER_ROADS = new Map([
	["Landroid/view/ViewTreeObserver;->addOnGlobalFocusChangeListener(Landroid/view/ViewTreeObserver$OnGlobalFocusChangeListener;)V", [CHESED_VIEW_TREE_ADD, "globalFocus"]],
	["Landroid/view/ViewTreeObserver;->removeOnGlobalFocusChangeListener(Landroid/view/ViewTreeObserver$OnGlobalFocusChangeListener;)V", [GEVURAH_VIEW_TREE_REMOVE, "globalFocus"]],
	["Landroid/view/ViewTreeObserver;->addOnGlobalLayoutListener(Landroid/view/ViewTreeObserver$OnGlobalLayoutListener;)V", [CHESED_VIEW_TREE_ADD, "globalLayout"]],
	["Landroid/view/ViewTreeObserver;->removeOnGlobalLayoutListener(Landroid/view/ViewTreeObserver$OnGlobalLayoutListener;)V", [GEVURAH_VIEW_TREE_REMOVE, "globalLayout"]],
	["Landroid/view/ViewTreeObserver;->removeGlobalOnLayoutListener(Landroid/view/ViewTreeObserver$OnGlobalLayoutListener;)V", [GEVURAH_VIEW_TREE_REMOVE, "globalLayout"]],
	["Landroid/view/ViewTreeObserver;->addOnPreDrawListener(Landroid/view/ViewTreeObserver$OnPreDrawListener;)V", [CHESED_VIEW_TREE_ADD, "preDraw"]],
	["Landroid/view/ViewTreeObserver;->removeOnPreDrawListener(Landroid/view/ViewTreeObserver$OnPreDrawListener;)V", [GEVURAH_VIEW_TREE_REMOVE, "preDraw"]],
	["Landroid/view/ViewTreeObserver;->addOnScrollChangedListener(Landroid/view/ViewTreeObserver$OnScrollChangedListener;)V", [CHESED_VIEW_TREE_ADD, "scrollChanged"]],
	["Landroid/view/ViewTreeObserver;->removeOnScrollChangedListener(Landroid/view/ViewTreeObserver$OnScrollChangedListener;)V", [GEVURAH_VIEW_TREE_REMOVE, "scrollChanged"]],
	["Landroid/view/ViewTreeObserver;->addOnTouchModeChangeListener(Landroid/view/ViewTreeObserver$OnTouchModeChangeListener;)V", [CHESED_VIEW_TREE_ADD, "touchMode"]],
	["Landroid/view/ViewTreeObserver;->removeOnTouchModeChangeListener(Landroid/view/ViewTreeObserver$OnTouchModeChangeListener;)V", [GEVURAH_VIEW_TREE_REMOVE, "touchMode"]],
	["Landroid/view/ViewTreeObserver;->addOnDrawListener(Landroid/view/ViewTreeObserver$OnDrawListener;)V", [CHESED_VIEW_TREE_ADD, "draw"]],
	["Landroid/view/ViewTreeObserver;->removeOnDrawListener(Landroid/view/ViewTreeObserver$OnDrawListener;)V", [GEVURAH_VIEW_TREE_REMOVE, "draw"]],
	["Landroid/view/ViewTreeObserver;->addOnWindowFocusChangeListener(Landroid/view/ViewTreeObserver$OnWindowFocusChangeListener;)V", [CHESED_VIEW_TREE_ADD, "windowFocus"]],
	["Landroid/view/ViewTreeObserver;->removeOnWindowFocusChangeListener(Landroid/view/ViewTreeObserver$OnWindowFocusChangeListener;)V", [GEVURAH_VIEW_TREE_REMOVE, "windowFocus"]],
	["Landroid/view/ViewTreeObserver;->addOnWindowAttachListener(Landroid/view/ViewTreeObserver$OnWindowAttachListener;)V", [CHESED_VIEW_TREE_ADD, "windowAttach"]],
	["Landroid/view/ViewTreeObserver;->removeOnWindowAttachListener(Landroid/view/ViewTreeObserver$OnWindowAttachListener;)V", [GEVURAH_VIEW_TREE_REMOVE, "windowAttach"]]
]);

/**
 * Returns the data route associated with one exact listener signature.
 * The function performs no runtime work; it is the pure data lookup boundary
 * between Android method names and our listener-storage API.
 * @param {string} sodSignature Exact Dalvik method signature.
 * @returns {[string,string]|null} Action/category tuple or null when unsupported.
 */
export function sodViewTreeListenerRoadFor(sodSignature) {
	return NETZACH_VIEW_TREE_LISTENER_ROADS.get(sodSignature) || null;
}

/**
 * Determines whether the exact ViewTreeObserver adapter owns a signature.
 * This keeps ownership logic data-based and testable without invoking the guest.
 * @param {string} sodSignature Exact Dalvik method signature.
 * @returns {boolean} True when this family owns the signature.
 */
export function chaiViewTreeObserverSignatureIsHandled(sodSignature) {
	return sodSignature === MALCHUS_VIEW_TREE_GET_SIGNATURE
		|| sodSignature === CHAYA_VIEW_TREE_ALIVE_SIGNATURE
		|| NETZACH_VIEW_TREE_LISTENER_ROADS.has(sodSignature);
}
