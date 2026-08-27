// B"H
// Boruch Hashem
// Blessed is He

const test = require("node:test");
const assert = require("node:assert/strict");
const os = require("os");
const path = require("path");
const fsp = require("fs/promises");

const dataDir = path.join(os.tmpdir(), `awtsmoos-game-rewards-${process.pid}`);
process.env.AWTSMOOS_WALLET_DATA_DIR = dataDir;

const { creditOnce, getWallet } = require("../core/store.js");
const {
	claimGameReward
} = require("../core/gameRewards/claim.js");

/**
 * B"H
 *
 * Witnesses tiny promotional victory rewards against isolated Wallet storage.
 * The Awtsmoos renews player, retry, cap, and gift beyond every finite win;
 * Awtsmoos.com proves enabled victory claims remain promotional, idempotent, and
 * bounded without ever minting purchased value or trusting a browser-supplied amount.
 */

test.beforeEach(async () => {
	await fsp.rm(dataDir, { recursive: true, force: true });
});

test.after(async () => {
	await fsp.rm(dataDir, { recursive: true, force: true });
});

test("Pong win credits exactly one promotional Perutah", async () => {
	const result = await claimGameReward(
		"reward-user",
		"pong.player_win",
		"pong-win-0001"
	);
	assert.equal(result.ok, true);
	assert.equal(result.reward.amount, 1);
	assert.equal(result.reward.balanceKind, "promotional");
	assert.equal(result.wallet.promotionalBalance, 601);
	assert.equal(result.wallet.purchasedBalance, 0);
	assert.equal(result.transaction.meta.kind, "game_reward");
});

test("duplicate idempotency key cannot credit twice", async () => {
	await claimGameReward(
		"dedupe-user",
		"pong.player_win",
		"pong-dedupe-01"
	);
	const result = await claimGameReward(
		"dedupe-user",
		"pong.player_win",
		"pong-dedupe-01"
	);
	assert.equal(result.ok, true);
	assert.equal(result.deduplicated, true);
	assert.equal((await getWallet("dedupe-user")).promotionalBalance, 601);
});

test("fourth Pong claim in one UTC day is rejected", async () => {
	for (let index = 1; index <= 3; index += 1) {
		const result = await claimGameReward(
			"limit-user",
			"pong.player_win",
			`pong-limit-000${index}`
		);
		assert.equal(result.ok, true);
	}
	const rejected = await claimGameReward(
		"limit-user",
		"pong.player_win",
		"pong-limit-0004"
	);
	assert.equal(rejected.error, "game_reward_claim_limit");
	assert.equal((await getWallet("limit-user")).promotionalBalance, 603);
});

test("full promotional Wallet receives no victory credit", async () => {
	await creditOnce("cap-user", 600, "fill-promo-cap", {
		balanceKind: "promotional"
	});
	const result = await claimGameReward(
		"cap-user",
		"pong.player_win",
		"pong-cap-0001"
	);
	assert.equal(result.error, "promotional_cap_reached");
	assert.equal((await getWallet("cap-user")).promotionalBalance, 1200);
});

test("disabled and unknown rewards cannot be claimed", async () => {
	const disabled = await claimGameReward(
		"closed-user",
		"connect4.beat_golem",
		"connect4-0001"
	);
	const unknown = await claimGameReward(
		"closed-user",
		"made-up.reward",
		"unknown-0001"
	);
	assert.equal(disabled.error, "game_reward_unavailable");
	assert.equal(unknown.error, "unknown_game_reward");
});
