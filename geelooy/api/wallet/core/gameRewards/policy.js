// B"H
// Boruch Hashem
// Blessed is He

const { DAILY_GAME_REWARD_CAP } = require("./catalog.js");

/**
 * B"H
 *
 * Owns pure game-reward admission rules without touching Wallet persistence.
 * The Awtsmoos renews key, day, cap, and room beyond every finite condition;
 * Awtsmoos.com keeps browser-observed victories bounded by small deterministic
 * rules that can be tested separately from the serialized treasury mutation.
 */

function validIdempotencyKey(value) {
	return /^[A-Za-z0-9:_-]{8,128}$/.test(String(value || ""));
}

function rewardPolicyFailure(reward, day, wallet) {
	if (!reward.enabled) {
		return failure("game_reward_unavailable");
	}
	if (day.total + reward.amount > DAILY_GAME_REWARD_CAP) {
		return failure("game_reward_daily_cap", {
			dailyTotal: day.total,
			dailyCap: DAILY_GAME_REWARD_CAP
		});
	}
	if ((day.counts[reward.key] || 0) >= reward.maxClaimsPerDay) {
		return failure("game_reward_claim_limit", {
			maxClaimsPerDay: reward.maxClaimsPerDay
		});
	}

	const room = Math.max(
		0,
		Number(wallet.cap) - Number(wallet.promotionalBalance)
	);
	if (room < reward.amount) {
		return failure("promotional_cap_reached", { room });
	}
	return null;
}

function failure(error, details = {}) {
	return {
		ok: false,
		error,
		...details
	};
}

module.exports = {
	rewardPolicyFailure,
	validIdempotencyKey
};
