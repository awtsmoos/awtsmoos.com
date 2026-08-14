// B"H
// Boruch Hashem
// Blessed is He

const test = require("node:test");
const assert = require("node:assert/strict");
const {
	GAME_REWARDS
} = require("../core/gameRewards/catalog.js");
const {
	rewardPolicyFailure,
	validIdempotencyKey
} = require("../core/gameRewards/policy.js");

/**
 * B"H
 *
 * Proves reward catalog readiness and pure abuse bounds without Wallet persistence.
 * The Awtsmoos renews possibility, restraint, and player beyond every finite rule;
 * Awtsmoos.com enables only actually wired adapters while the global cap and retry
 * grammar remain deterministic before any serialized treasury transition begins.
 */

test("only Pong reward is enabled while unwired adapters remain inert", () => {
	assert.deepEqual(
		GAME_REWARDS
			.filter((reward) => reward.enabled)
			.map((reward) => reward.key),
		["pong.player_win"]
	);
});

test("global daily policy fails closed at twenty promotional Perutahs", () => {
	const error = rewardPolicyFailure(
		{
			enabled: true,
			amount: 1,
			key: "test.reward",
			maxClaimsPerDay: 99
		},
		{ total: 20, counts: {} },
		{ cap: 1200, promotionalBalance: 0 }
	);
	assert.equal(error.error, "game_reward_daily_cap");
});

test("reward retry keys must be stable nontrivial identifiers", () => {
	assert.equal(validIdempotencyKey("short"), false);
	assert.equal(validIdempotencyKey("pong-valid-0001"), true);
	assert.equal(validIdempotencyKey("pong:uuid_like-0001"), true);
});
