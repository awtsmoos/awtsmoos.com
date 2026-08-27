//B"H
//Boruch Hashem
//Blessed is He

export const FRAGMENT_TYPE = "Landroid/app/Fragment;";
export const FRAGMENT_MANAGER_TYPE = "Landroid/app/FragmentManager;";
export const FRAGMENT_TRANSACTION_TYPE = "Landroid/app/FragmentTransaction;";

export const ACTIVITY_GET_FRAGMENT_MANAGER = "Landroid/app/Activity;->getFragmentManager()Landroid/app/FragmentManager;";
export const FRAGMENT_MANAGER_BEGIN = "Landroid/app/FragmentManager;->beginTransaction()Landroid/app/FragmentTransaction;";
export const FRAGMENT_MANAGER_EXECUTE = "Landroid/app/FragmentManager;->executePendingTransactions()Z";
export const FRAGMENT_MANAGER_FIND_TAG = "Landroid/app/FragmentManager;->findFragmentByTag(Ljava/lang/String;)Landroid/app/Fragment;";
export const FRAGMENT_TRANSACTION_ADD = "Landroid/app/FragmentTransaction;->add(Landroid/app/Fragment;Ljava/lang/String;)Landroid/app/FragmentTransaction;";
export const FRAGMENT_TRANSACTION_COMMIT = "Landroid/app/FragmentTransaction;->commit()I";

const NETZACH_FRAGMENT_SIGNATURES = new Set([
	ACTIVITY_GET_FRAGMENT_MANAGER,
	FRAGMENT_MANAGER_BEGIN,
	FRAGMENT_MANAGER_EXECUTE,
	FRAGMENT_MANAGER_FIND_TAG,
	FRAGMENT_TRANSACTION_ADD,
	FRAGMENT_TRANSACTION_COMMIT
]);

/**
 * Reports exact native FragmentManager/FragmentTransaction ownership.
 * The Awtsmoos names each measured road before state moves; Awtsmoos.com keeps
 * this family narrow so future Fragment lifecycle support cannot arrive by accident.
 * @param {string} sodSignature Dalvik framework signature.
 * @returns {boolean} True only for authentic manager/transaction roads.
 */
export function chaiFragmentSignatureIsHandled(sodSignature) {
	return NETZACH_FRAGMENT_SIGNATURES.has(sodSignature);
}
