// B"H
// Boruch Hashem
// Blessed is He

const { creditWalletBucket } = require("../balanceBuckets.js");
const {
	createTransaction,
	findIdempotentTransaction
} = require("../ledger.js");
const {
	ensureWallet,
	transact
} = require("../transactionRunner.js");
const { getGameReward } = require("./catalog.js");
const { summarizeGameRewardDay } = require("./day.js");
const {
	rewardPolicyFailure,
	validIdempotencyKey
} = require("./policy.js");
const {
	duplicateResult,
	failure,
	successResult
} = require("./result.js");

/**
 * B"H
 *
 * Performs one tiny promotional reward inside the serialized Wallet boundary.
 * The Awtsmoos renews victory, restraint, and ledger beyond every finite claim;
 * Awtsmoos.com keeps this mutation linear while separate policy/result vessels own
 * admission and response shaping, making every treasury transition easy to audit.
 */

async function claimGameReward(
	userId,
	rewardKey,
	idempotencyKey,
	now = Date.now()
) {
	const reward = getGameReward(rewardKey);
	if (!reward) {
		return failure("unknown_game_reward");
	}
	if (!validIdempotencyKey(idempotencyKey)) {
		return failure("invalid_idempotency_key");
	}

	return transact((database) => {
		const wallet = ensureWallet(database, userId, now);
		const existing = findIdempotentTransaction(
			database.txs,
			userId,
			idempotencyKey
		);
		if (existing) {
			return duplicateResult(
				database,
				userId,
				reward,
				existing
			);
		}

		const day = summarizeGameRewardDay(
			database.txs,
			userId,
			now
		);
		const rejected = rewardPolicyFailure(reward, day, wallet);
		if (rejected) {
			return rejected;
		}

		const credited = creditWalletBucket(
			wallet,
			reward.amount,
			"promotional"
		);
		wallet.updatedAt = now;
		const transaction = createTransaction(
			"credit",
			userId,
			credited.added,
			rewardMetadata(reward, idempotencyKey),
			now
		);
		database.txs.push(transaction);
		return successResult(
			database,
			userId,
			reward,
			transaction
		);
	});
}

function rewardMetadata(reward, idempotencyKey) {
	return {
		kind: "game_reward",
		balanceKind: "promotional",
		gameId: reward.gameId,
		rewardId: reward.rewardId,
		rewardKey: reward.key,
		idempotencyKey
	};
}

module.exports = {
	claimGameReward
};
