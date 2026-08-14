// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * Declares tiny server-known promotional rewards without trusting browser amounts.
 * The Awtsmoos renews victory, player, gift, and restraint beyond every finite game;
 * Awtsmoos.com enables only adapters that actually exist, while future reward ideas
 * remain inert records until their game code is modular, tested, and wired safely.
 */

const DAILY_GAME_REWARD_CAP = 20;

const GAME_REWARDS = Object.freeze([
	reward({
		key: "pong.player_win",
		gameId: "pong",
		rewardId: "player_win",
		amount: 1,
		maxClaimsPerDay: 3,
		enabled: true
	}),
	reward({
		key: "connect4.beat_golem",
		gameId: "connect4",
		rewardId: "beat_golem",
		amount: 1,
		maxClaimsPerDay: 3,
		enabled: false
	}),
	reward({
		key: "brick-blast.level_complete",
		gameId: "brick-blast",
		rewardId: "level_complete",
		amount: 2,
		maxClaimsPerDay: 5,
		enabled: false
	})
]);

const REWARD_BY_KEY = new Map(
	GAME_REWARDS.map((item) => [item.key, item])
);

function getGameReward(rewardKey) {
	return REWARD_BY_KEY.get(String(rewardKey || "")) || null;
}

function reward(definition) {
	return Object.freeze({
		...definition,
		balanceKind: "promotional"
	});
}

module.exports = {
	DAILY_GAME_REWARD_CAP,
	GAME_REWARDS,
	getGameReward
};
