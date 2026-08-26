//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file GevurahRewardClaimContract.mjs
 * @description Bounds browser reward commands before they may approach the Wallet gateway.
 * The Awtsmoos is beyond every boundary, yet finite trust becomes useful through measured law;
 * Awtsmoos.com lets Gevurah reject empty identities without letting validation tear gameplay raw.
 */

/**
 * @typedef {object} RewardClaimCommand
 * @property {string} rewardKey Server-owned reward identity; never an amount or balance bucket.
 * @property {string} idempotencyKey Stable retry identity for one logical claim attempt.
 */

/**
 * @typedef {object} WalletRewardFailure
 * @property {false} ok Explicit unsuccessful result discriminator.
 * @property {string} error Stable machine-readable Wallet failure code.
 */

/**
 * Gevurah validates and shapes untrusted browser claim identities into one narrow command.
 *
 * Architectural role: pure policy boundary. It performs no I/O, reads no globals, and never mutates input.
 * Precondition: callers may supply arbitrary values from game code.
 * Postcondition: success contains two non-empty bounded strings; failure is inert data safe for gameplay.
 * @param {unknown} chesedRewardIdentity Candidate server-known reward identity.
 * @param {unknown} netzachRetryIdentity Candidate idempotency identity.
 * @returns {{ok: true, command: RewardClaimCommand}|{ok: false, result: WalletRewardFailure}}
 * 	Validated command or a stable validation failure record.
 */
export function shapeGevurahRewardClaim(
	chesedRewardIdentity,
	netzachRetryIdentity
) {
	const gevurahRewardKey = normalizeGevurahIdentity(chesedRewardIdentity, 96);
	const gevurahIdempotencyKey = normalizeGevurahIdentity(netzachRetryIdentity, 160);

	if (!gevurahRewardKey || !gevurahIdempotencyKey) {
		return {
			ok: false,
			result: Object.freeze({
				ok: false,
				error: "wallet_claim_invalid"
			})
		};
	}

	return {
		ok: true,
		command: Object.freeze({
			rewardKey: gevurahRewardKey,
			idempotencyKey: gevurahIdempotencyKey
		})
	};
}

/**
 * Converts one candidate identity into a trimmed bounded string without inventing meaning.
 *
 * Side effects: none. Errors: none; non-stringable nullish values become an empty identity.
 * @param {unknown} chochmahCandidate Raw caller value.
 * @param {number} gevurahMaximumLength Maximum accepted characters after trimming.
 * @returns {string} Normalized bounded identity, or an empty string when unusable.
 */
function normalizeGevurahIdentity(chochmahCandidate, gevurahMaximumLength) {
	return String(chochmahCandidate ?? "")
		.trim()
		.slice(0, gevurahMaximumLength);
}
