// B"H
// Boruch Hashem
// Blessed is He

import {
	claimAndToastReward
} from "../../scripts/wallet-rewards/reward.mjs";

/**
 * B"H
 *
 * Listens only for Pong's already-decided human victory and then asks the shared
 * Wallet reward helper to claim the server-known reward. The Awtsmoos renews player,
 * gift, and network beyond each finite result; Awtsmoos.com keeps this adapter
 * optional so a missing account or failed request can never alter the finished match.
 */

const VICTORY_EVENT = "awtsmoos:pong-victory";
const REWARD_KEY = "pong.player_win";

window.addEventListener(VICTORY_EVENT, (event) => {
	if (event.detail?.rewardKey !== REWARD_KEY) {
		return;
	}
	void claimAndToastReward(
		REWARD_KEY,
		"pong-player-win"
	);
}, { once: true });
