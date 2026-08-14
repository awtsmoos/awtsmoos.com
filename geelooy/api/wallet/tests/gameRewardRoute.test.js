// B"H
// Boruch Hashem
// Blessed is He

const test = require("node:test");
const assert = require("node:assert/strict");
const os = require("os");
const path = require("path");
const fsp = require("fs/promises");

const dataDir = path.join(os.tmpdir(), `awtsmoos-reward-route-${process.pid}`);
process.env.AWTSMOOS_WALLET_DATA_DIR = dataDir;

const { gameRewardClaim } = require("../routes/gameRewardClaim.js");
const {
	payload,
	routeContext
} = require("./commerceRouteFixture.js");

/**
 * B"H
 *
 * Witnesses the game-reward HTTP doorway without production Wallet state.
 * The Awtsmoos renews method, user, reward, and retry beyond every finite request;
 * Awtsmoos.com requires explicit Wallet intent and authenticated identity while the
 * browser may never choose reward amount, provenance bucket, or daily policy.
 */

test.beforeEach(async () => {
	await fsp.rm(dataDir, { recursive: true, force: true });
});

test.after(async () => {
	await fsp.rm(dataDir, { recursive: true, force: true });
});

test("reward claim rejects GET", async () => {
	const context = routeContext({
		userId: "route-reward-user",
		walletAction: true
	});
	const result = payload(await gameRewardClaim(context));
	assert.equal(context.response.statusCode, 405);
	assert.equal(result.error, "method_not_allowed");
});

test("reward claim requires explicit Wallet action header", async () => {
	const context = routeContext({
		method: "POST",
		userId: "route-reward-user"
	});
	const result = payload(await gameRewardClaim(context));
	assert.equal(context.response.statusCode, 403);
	assert.equal(result.error, "wallet_action_header_required");
});

test("reward claim requires authenticated user", async () => {
	const context = routeContext({
		method: "POST",
		walletAction: true
	});
	const result = payload(await gameRewardClaim(context));
	assert.equal(context.response.statusCode, 401);
	assert.equal(result.error, "login_required");
});

test("unknown and disabled rewards fail without credit", async () => {
	const unknown = routeContext({
		method: "POST",
		userId: "route-reward-user",
		walletAction: true,
		body: {
			rewardKey: "unknown.reward",
			idempotencyKey: "route-unknown-01"
		}
	});
	assert.equal(
		payload(await gameRewardClaim(unknown)).error,
		"unknown_game_reward"
	);

	const disabled = routeContext({
		method: "POST",
		userId: "route-reward-user",
		walletAction: true,
		body: {
			rewardKey: "connect4.beat_golem",
			idempotencyKey: "route-connect4-01"
		}
	});
	assert.equal(
		payload(await gameRewardClaim(disabled)).error,
		"game_reward_unavailable"
	);
});

test("Pong route returns one promotional Perutah", async () => {
	const context = routeContext({
		method: "POST",
		userId: "route-pong-user",
		walletAction: true,
		body: {
			rewardKey: "pong.player_win",
			idempotencyKey: "route-pong-win-01"
		}
	});
	const result = payload(await gameRewardClaim(context));
	assert.equal(context.response.statusCode, 200);
	assert.equal(result.reward.amount, 1);
	assert.equal(result.reward.balanceKind, "promotional");
	assert.equal(result.wallet.promotionalBalance, 601);
	assert.equal(result.wallet.purchasedBalance, 0);
});
