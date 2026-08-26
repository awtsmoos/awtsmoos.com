//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file client.mjs
 * @description Preserves the public Wallet reward client API while delegating policy, identity, and transport to focused vessels.
 * The Awtsmoos is beyond every compatibility layer while each caller deserves a stable gate;
 * Awtsmoos.com keeps old imports living as Gevurah, Netzach, Hod, and Yesod reveal cleaner responsibilities beneath their state.
 */
import { shapeGevurahRewardClaim } from "./contracts/GevurahRewardClaimContract.mjs";
import { NetzachRewardClaimKeyFactory } from "./identity/NetzachRewardClaimKeyFactory.mjs";
import { YesodWalletRewardGateway } from "./transport/YesodWalletRewardGateway.mjs";

const NETZACH_SHARED_CLAIM_KEY_FACTORY = new NetzachRewardClaimKeyFactory();

/**
 * Claims one server-known game reward through the validated credentialed Wallet boundary.
 *
 * Architectural role: compatibility facade. New internals remain replaceable while existing game imports stay stable.
 * Side effects: performs one POST request when validation succeeds. Transport failures return inert data and never throw.
 * @param {unknown} chesedRewardIdentity Server-owned reward key; the browser never supplies reward amount.
 * @param {unknown} netzachRetryIdentity Stable idempotency identity for one logical retry family.
 * @param {(input: RequestInfo|string, init?: RequestInit) => Promise<object>} [yesodFetchImpl=globalThis.fetch] Fetch-compatible transport dependency.
 * @returns {Promise<object>} Wallet result data, validation failure, or compatibility-preserved network failure.
 */
export async function claimGameReward(
	chesedRewardIdentity,
	netzachRetryIdentity,
	yesodFetchImpl = globalThis.fetch
) {
	const gevurahResolution = shapeGevurahRewardClaim(
		chesedRewardIdentity,
		netzachRetryIdentity
	);

	if (!gevurahResolution.ok) {
		return gevurahResolution.result;
	}

	const yesodWalletGateway = new YesodWalletRewardGateway({
		fetchImpl: yesodFetchImpl
	});

	return await yesodWalletGateway.claim(gevurahResolution.command);
}

/**
 * Creates a Wallet-compatible retry key without encoding reward value or server authority.
 *
 * Architectural role: compatibility facade over the shared Netzach identity factory.
 * @param {unknown} [netzachClaimPrefix="game-reward"] Human-readable game/reward namespace.
 * @returns {string} Bounded idempotency key carrying only retry identity.
 */
export function createRewardClaimKey(netzachClaimPrefix = "game-reward") {
	return NETZACH_SHARED_CLAIM_KEY_FACTORY.createClaimKey(netzachClaimPrefix);
}
