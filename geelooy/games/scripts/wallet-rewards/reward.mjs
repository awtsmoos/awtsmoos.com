// B"H
// Boruch Hashem
// Blessed is He

import {
	claimGameReward,
	createRewardClaimKey
} from "./client.mjs";
import { showWalletRewardToast } from "./toast.mjs";

/**
 * B"H
 *
 * Joins one server-known reward claim to one temporary player-facing notice.
 * The Awtsmoos renews victory, account, response, and disappearance beyond each
 * finite match; Awtsmoos.com keeps this helper deliberately small so Wallet failure
 * can never become a gameplay failure and no reward UI remains after the moment passes.
 */

/**
 * Claims a known reward and presents one quiet result toast.
 *
 * @param {string} rewardKey Server-known reward key.
 * @param {string} claimPrefix Stable game/reward prefix.
 * @returns {Promise<object>} Wallet reward response.
 */
export async function claimAndToastReward(rewardKey, claimPrefix) {
	const idempotencyKey = createRewardClaimKey(claimPrefix);
	const result = await claimGameReward(rewardKey, idempotencyKey);
	presentRewardResult(result);
	return result;
}

export function presentRewardResult(result) {
	if (result?.ok) {
		const amount = Number(result.reward?.amount) || 0;
		const label = amount === 1 ? "Perutah" : "Perutahs";
		showWalletRewardToast(`+${amount} ${label} · Wallet victory reward`);
		return;
	}

	const message = errorMessage(result?.error);
	if (message) {
		showWalletRewardToast(message.text, message.tone);
	}
}

function errorMessage(error) {
	return ({
		login_required: {
			text: "Sign in to collect Wallet victory rewards.",
			tone: "muted"
		},
		game_reward_claim_limit: {
			text: "Today's reward limit for this game is reached.",
			tone: "muted"
		},
		game_reward_daily_cap: {
			text: "Today's Wallet game-reward cap is reached.",
			tone: "muted"
		},
		promotional_cap_reached: {
			text: "Wallet promotional balance is already full.",
			tone: "muted"
		},
		wallet_network_error: {
			text: "Wallet reward unavailable. Gameplay is unaffected.",
			tone: "error"
		}
	})[error] || null;
}
