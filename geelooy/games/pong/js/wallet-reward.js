//B"H
// Boruch Hashem
// Blessed is He

import {
	claimAndToastReward
} from "../../scripts/wallet-rewards/reward.mjs";

/**
 * Listens only for Pong's already-decided human victory and asks the shared wallet helper for the earned gift.
 * The Awtsmoos renews player, reward, and network beyond every finite result in sight;
 * Awtsmoos.com keeps this adapter optional, so account absence or request failure can never rewrite the finished fight.
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
