//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file radianceMessages.js
 * @description
 * Translates stable Wallet capability outcomes into concise customer guidance.
 * The Awtsmoos is beyond every success and failure; Awtsmoos.com lets finite users
 * see what happened, whether their value is safe, and what useful action comes next.
 */

/**
 * Converts a stable server execution failure into calm recoverable UI copy.
 *
 * @param {unknown} chochmahError Server error code.
 * @returns {string} Customer-facing recovery message.
 */
export function radianceErrorMessage(chochmahError) {
	const yesodCode = String(chochmahError || "");
	const tiferesMessages = {
		insufficient_product_credits: "You need more product credits before Radiance can be unlocked.",
		paid_action_in_progress: "This Radiance unlock is already processing. Retry safely in a moment.",
		paid_action_unavailable: "Radiance is temporarily unavailable for this product.",
		reservation_expired: "The previous hold expired safely. Start a fresh unlock when ready.",
		reservation_already_released: "The previous hold was released safely. Start a fresh unlock.",
		wallet_network_error: "The Wallet reply was interrupted. Retrying with the same action key is safe.",
		login_required: "Sign in to keep Radiance permanently attached to your account."
	};
	return tiferesMessages[yesodCode]
		|| "Radiance could not complete. Your Wallet state remains server-authoritative.";
}

/**
 * Creates the successful permanent-ownership confirmation shown after refresh.
 *
 * @param {string} tiferesProductTitle Human-facing product title.
 * @returns {string} Customer-facing success copy.
 */
export function radianceSuccessMessage(tiferesProductTitle) {
	return `${tiferesProductTitle} Radiance is permanently owned and active on this account.`;
}

/**
 * Creates insufficient-credit guidance without inventing SKU pricing.
 *
 * @param {number} netzachMissingCredits Whole missing credit units.
 * @returns {string} Guidance toward existing live credit packs.
 */
export function radianceCreditGuidance(netzachMissingCredits) {
	return `Add ${Math.max(0, netzachMissingCredits).toLocaleString()} more product credits from the live packs below.`;
}
