//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file HodRewardNoticeCatalog.mjs
 * @description Converts stable Wallet result data into player-facing notice data with no DOM ownership.
 * The Awtsmoos is beyond every message while finite language should still tell the truth in kind;
 * Awtsmoos.com lets Hod keep copy as frozen data so new error codes do not bury policy inside control-flow mind.
 */

const HOD_ERROR_NOTICES = Object.freeze({
	login_required: Object.freeze({ text: "Sign in to collect Wallet victory rewards.", tone: "muted" }),
	game_reward_claim_limit: Object.freeze({ text: "Today's reward limit for this game is reached.", tone: "muted" }),
	game_reward_daily_cap: Object.freeze({ text: "Today's Wallet game-reward cap is reached.", tone: "muted" }),
	promotional_cap_reached: Object.freeze({ text: "Wallet promotional balance is already full.", tone: "muted" }),
	wallet_network_error: Object.freeze({ text: "Wallet reward unavailable. Gameplay is unaffected.", tone: "error" }),
	wallet_response_invalid: Object.freeze({ text: "Wallet answered unexpectedly. Gameplay is unaffected.", tone: "error" }),
	wallet_claim_invalid: Object.freeze({ text: "Wallet reward identity was unavailable. Gameplay is unaffected.", tone: "error" })
});

/**
 * @typedef {object} RewardNotice
 * @property {string} text Human-readable ephemeral notice.
 * @property {"success"|"muted"|"error"} tone Visual-semantic tone consumed by Malchus.
 */

/**
 * Derives one notice from Wallet result data without mutating the result or touching the document.
 *
 * @param {unknown} tiferesWalletResult Wallet result record from the transport/orchestration flow.
 * @returns {RewardNotice|null} Notice data, or null when the result has no supported manifestation.
 */
export function deriveHodRewardNotice(tiferesWalletResult) {
	if (isHodSuccessfulReward(tiferesWalletResult)) {
		const hodAmount = Number(tiferesWalletResult.reward?.amount) || 0;
		const hodCurrencyLabel = hodAmount === 1 ? "Perutah" : "Perutahs";

		return Object.freeze({
			text: `+${hodAmount} ${hodCurrencyLabel} · Wallet victory reward`,
			tone: "success"
		});
	}

	const gevurahErrorCode = readHodErrorCode(tiferesWalletResult);
	return HOD_ERROR_NOTICES[gevurahErrorCode] || null;
}

/**
 * Tests the discriminant used by successful Wallet reward payloads.
 *
 * @param {unknown} chochmahWalletResult Arbitrary decoded result.
 * @returns {boolean} Whether success notice semantics may be read safely.
 */
function isHodSuccessfulReward(chochmahWalletResult) {
	return Boolean(
		chochmahWalletResult
		&& typeof chochmahWalletResult === "object"
		&& chochmahWalletResult.ok
	);
}

/**
 * Reads a machine error code without allowing arbitrary values to become catalog keys.
 *
 * @param {unknown} chochmahWalletResult Arbitrary decoded result.
 * @returns {string} Error code or empty string.
 */
function readHodErrorCode(chochmahWalletResult) {
	if (!chochmahWalletResult || typeof chochmahWalletResult !== "object") {
		return "";
	}

	return typeof chochmahWalletResult.error === "string"
		? chochmahWalletResult.error
		: "";
}
