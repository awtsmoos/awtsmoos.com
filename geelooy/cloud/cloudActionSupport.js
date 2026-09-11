//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module CloudActionSupport
 * @description Keeps non-financial browser convenience separate from Wallet authority.
 */

/** Preserves the pending reservation and brief only in this browser session. */
export function rememberPendingReservation(skuId, brief = "") {
	try {
		sessionStorage.setItem("awtsmoosCloudPendingSku", String(skuId || ""));
		sessionStorage.setItem("awtsmoosCloudBrief", String(brief || "").slice(0, 6000));
	} catch (error) {
		return false;
	}
	return true;
}

/** Converts known Wallet failures into concise customer-facing Cloud guidance. */
export function cloudPurchaseError(code) {
	const messages = {
		already_owned: "This reservation already belongs to your account.",
		insufficient_purchased_perutahs: "Your purchased-Peruta balance is too low. Fund Wallet, then return here to reserve.",
		login_required: "Sign in before reserving founder-assisted work.",
		sku_unavailable: "This reservation is not currently available.",
		wallet_network_error: "The network reply was interrupted. Retry safely; the same purchase attempt will be reused."
	};
	return messages[code] || `Reservation could not be completed${code ? `: ${code}` : "."}`;
}
