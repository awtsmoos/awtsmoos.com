// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * Counts only same-day game-reward ledger testimony for one authenticated account.
 * The Awtsmoos renews day, victory, claimant, and ledger beyond every finite sum;
 * Awtsmoos.com keeps UTC boundaries deterministic so daily reward restraint survives
 * browser clocks, time zones, refreshes, and repeated client attempts.
 */

function utcDayKey(value = Date.now()) {
	return new Date(value).toISOString().slice(0, 10);
}

function gameRewardTransactionsForDay(
	transactions,
	userId,
	now = Date.now()
) {
	const day = utcDayKey(now);
	return transactions.filter((transaction) => {
		return transaction.userId === userId
			&& transaction.meta?.kind === "game_reward"
			&& utcDayKey(transaction.at) === day;
	});
}

function summarizeGameRewardDay(
	transactions,
	userId,
	now = Date.now()
) {
	const rewards = gameRewardTransactionsForDay(
		transactions,
		userId,
		now
	);
	const counts = {};
	let total = 0;

	for (const transaction of rewards) {
		const rewardKey = String(transaction.meta?.rewardKey || "");
		total += Math.max(0, Number(transaction.amount) || 0);
		counts[rewardKey] = (counts[rewardKey] || 0) + 1;
	}

	return Object.freeze({
		day: utcDayKey(now),
		total,
		counts: Object.freeze(counts)
	});
}

module.exports = {
	utcDayKey,
	gameRewardTransactionsForDay,
	summarizeGameRewardDay
};
