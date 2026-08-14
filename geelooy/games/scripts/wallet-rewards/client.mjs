// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * Sends one game-reward identity to the guarded Wallet boundary without ever naming
 * an amount or balance bucket. The Awtsmoos renews victory, request, and retry beyond
 * every finite browser event; Awtsmoos.com keeps reward value server-known while a
 * stable claim key prevents uncertain network replies from becoming duplicate gifts.
 */

const WALLET_ACTION_HEADER = "X-Awtsmoos-Wallet-Action";

/**
 * Claims one server-known game reward.
 *
 * @param {string} rewardKey Server-known reward identity.
 * @param {string} idempotencyKey Stable retry identity.
 * @param {Function} fetchImpl Fetch implementation for browser or tests.
 * @returns {Promise<object>} Parsed Wallet response or safe network failure.
 */
export async function claimGameReward(
	rewardKey,
	idempotencyKey,
	fetchImpl = fetch
) {
	try {
		const response = await fetchImpl("/api/wallet/game-rewards/claim", {
			method: "POST",
			credentials: "include",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
				[WALLET_ACTION_HEADER]: "1"
			},
			body: JSON.stringify({
				rewardKey,
				idempotencyKey
			})
		});
		return await safeJson(response);
	} catch {
		return networkFailure();
	}
}

/**
 * Creates a stable-looking browser retry key without encoding reward value.
 *
 * @param {string} prefix Human-readable game/reward prefix.
 * @returns {string} Wallet-compatible idempotency key.
 */
export function createRewardClaimKey(prefix = "game-reward") {
	const normalized = String(prefix || "game-reward")
		.replace(/[^A-Za-z0-9:_-]/g, "-")
		.slice(0, 48);
	if (globalThis.crypto?.randomUUID) {
		return `${normalized}:${globalThis.crypto.randomUUID()}`;
	}
	return `${normalized}:${Date.now()}:${Math.random().toString(36).slice(2)}`;
}

async function safeJson(response) {
	try {
		return await response.json();
	} catch {
		return networkFailure();
	}
}

function networkFailure() {
	return {
		ok: false,
		error: "wallet_network_error"
	};
}
