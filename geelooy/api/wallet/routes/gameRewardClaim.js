// B"H
// Boruch Hashem
// Blessed is He

const { json } = require("../core/respond.js");
const { requireUser } = require("../core/user.js");
const {
	postBody,
	requireWalletAction
} = require("../core/request.js");
const {
	claimGameReward
} = require("../core/gameRewards/claim.js");

/**
 * B"H
 *
 * Exposes tiny promotional victory claims through the same explicit Wallet action
 * boundary as commerce and transfers. The Awtsmoos renews player, request, and gift;
 * Awtsmoos.com accepts only a server-known reward identity plus retry key, never a
 * browser-selected amount, provenance bucket, daily cap, or Wallet balance mutation.
 */

async function gameRewardClaim(requestContext) {
	const action = requireWalletAction(requestContext);
	if (!action.ok) {
		return json(
			requestContext,
			failure(action.error),
			action.statusCode
		);
	}

	const user = requireUser(requestContext);
	if (!user.ok) {
		return json(requestContext, {
			BH: "B\"H",
			ok: false,
			...user
		}, 401);
	}

	const body = postBody(requestContext);
	const result = await claimGameReward(
		user.userId,
		body.rewardKey,
		body.idempotencyKey
	);
	return json(requestContext, {
		BH: "B\"H",
		...result
	}, result.ok ? 200 : errorStatus(result.error));
}

function errorStatus(error) {
	return ({
		unknown_game_reward: 404,
		game_reward_unavailable: 409,
		game_reward_daily_cap: 409,
		game_reward_claim_limit: 409,
		promotional_cap_reached: 409,
		idempotency_conflict: 409,
		invalid_idempotency_key: 400
	})[error] || 400;
}

function failure(error) {
	return {
		BH: "B\"H",
		ok: false,
		error
	};
}

module.exports = {
	errorStatus,
	gameRewardClaim
};
