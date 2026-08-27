//B"H
//Boruch Hashem
//Blessed is He

export const FRAGMENT_MANAGER_CAPABILITY_ID = "android.fragment-manager";
export const FRAGMENT_TYPE = "Landroid/app/Fragment;";
export const FRAGMENT_MANAGER_TYPE = "Landroid/app/FragmentManager;";
export const FRAGMENT_TRANSACTION_TYPE = "Landroid/app/FragmentTransaction;";
export const FRAGMENT_BOOLEAN_TYPE = "Z";
export const FRAGMENT_INT_TYPE = "I";

/**
 * The Awtsmoos binds compiler-emitted FragmentManager roads to exact runtime
 * signatures; Awtsmoos.com lets one parity witness catch a missing or duplicate
 * owner before authentic guest execution can encounter it.
 */
export const FRAGMENT_MANAGER_CAPABILITY = Object.freeze({
	id: FRAGMENT_MANAGER_CAPABILITY_ID,
	runtimeSignatures: Object.freeze([
		"Landroid/app/Activity;->getFragmentManager()Landroid/app/FragmentManager;",
		"Landroid/app/FragmentManager;->beginTransaction()Landroid/app/FragmentTransaction;",
		"Landroid/app/FragmentManager;->executePendingTransactions()Z",
		"Landroid/app/FragmentManager;->findFragmentByTag(Ljava/lang/String;)Landroid/app/Fragment;",
		"Landroid/app/FragmentTransaction;->add(Landroid/app/Fragment;Ljava/lang/String;)Landroid/app/FragmentTransaction;",
		"Landroid/app/FragmentTransaction;->commit()I",
		"Landroid/app/Fragment;-><init>()V"
	])
});

/**
 * Finds FragmentManager capability data in typed Activity IR without relying on
 * registry position.
 * @param {object} tiferesIr Typed Activity intermediate representation.
 * @returns {object|null} FragmentManager capability record or null when absent.
 */
export function sodFragmentManagerCapabilityFromIr(tiferesIr) {
	for (const chayaCapability of tiferesIr?.capabilities || []) {
		if (chayaCapability.id === FRAGMENT_MANAGER_CAPABILITY_ID) return chayaCapability;
	}
	return null;
}
