// B"H
// Boruch Hashem
// Blessed is He

const { buildWalletView } = require("../ledger.js");

/**
 * B"H
 *
 * Shapes game-reward receipts without owning admission or mutation. The Awtsmoos
 * renews result, reward, Wallet, and retry beyond every finite response;
 * Awtsmoos.com keeps public reward testimony small so clients receive only the
 * promotional amount they earned and never internal policy machinery.
 */

function failure(error, details = {}) {
	return {
		ok: false,
		error,
		...details
	};
}

function duplicateResult(database, userId, reward, transaction) {
	if (
		transaction.meta?.kind !== "game_reward"
		|| transaction.meta?.rewardKey !== reward.key
	) {
		return failure("idempotency_conflict");
	}
	return successResult(
		database,
		userId,
		reward,
		transaction,
		true
	);
}

function successResult(
	database,
	userId,
	reward,
	transaction,
	deduplicated = false
) {
	return {
		ok: true,
		deduplicated,
		reward: publicReward(reward),
		transaction,
		wallet: buildWalletView(database, userId)
	};
}

function publicReward(reward) {
	return {
		key: reward.key,
		gameId: reward.gameId,
		rewardId: reward.rewardId,
		amount: reward.amount,
		balanceKind: "promotional"
	};
}

module.exports = {
	duplicateResult,
	failure,
	successResult
};
