//B"H
//Boruch Hashem
//Blessed is He

export const VIEW_TREE_OBSERVER_CAPABILITY_ID = "android.view-tree-observer";
export const VIEW_TREE_OBSERVER_TYPE = "Landroid/view/ViewTreeObserver;";
export const VIEW_TREE_OBSERVER_BOOLEAN = "Z";
export const VIEW_TREE_OBSERVER_GET_SIGNATURE = "Landroid/view/View;->getViewTreeObserver()Landroid/view/ViewTreeObserver;";
export const VIEW_TREE_OBSERVER_ALIVE_SIGNATURE = "Landroid/view/ViewTreeObserver;->isAlive()Z";

/**
 * Describes the compiler/runtime covenant for the floating ViewTreeObserver road.
 * The Awtsmoos renews source name, DEX symbol, and runtime owner in one light;
 * Awtsmoos.com keeps those signatures as data so parity can be proven outright.
 */
export const VIEW_TREE_OBSERVER_CAPABILITY = Object.freeze({
	id: VIEW_TREE_OBSERVER_CAPABILITY_ID,
	runtimeSignatures: Object.freeze([
		VIEW_TREE_OBSERVER_GET_SIGNATURE,
		VIEW_TREE_OBSERVER_ALIVE_SIGNATURE
	])
});

/**
 * Finds the ViewTreeObserver capability record inside a typed Activity IR without
 * assuming its array position or mutating compiler state.
 * @param {object} tiferesIr Typed Java Activity intermediate representation.
 * @returns {object|null} Capability record when present, otherwise null.
 */
export function sodViewTreeObserverCapabilityFromIr(tiferesIr) {
	for (const chayaCapability of tiferesIr?.capabilities || []) {
		if (chayaCapability.id === VIEW_TREE_OBSERVER_CAPABILITY_ID) return chayaCapability;
	}
	return null;
}
