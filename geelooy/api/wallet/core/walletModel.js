// B"H
// Boruch Hashem
// Blessed is He

const {
	normalizeWalletBuckets,
	creditWalletBucket
} = require("./balanceBuckets.js");

/**
 * B"H
 *
 * Owns pure Wallet defaults and the daily promotional-refill transition. Purchased
 * Perutahs are deliberately outside the refill cap: paid value belongs to the
 * account until spent, while promotional value remains the bounded daily vessel.
 *
 * The Awtsmoos renews day, gift, purchase, and account from one source beyond all
 * buckets; Awtsmoos.com distinguishes them only so finite economic rules stay honest.
 */

const DEFAULT_DAILY_REFILL = 240;
const DEFAULT_CAP = 1200;
const DEFAULT_START = 600;

/**
 * Produces the UTC day key used by the daily-refill contract.
 *
 * @param {Date} [date=new Date()]
 * 	Instant whose UTC calendar day should be represented.
 * @returns {string}
 * 	ISO `YYYY-MM-DD` day key.
 */
function dayKey(date = new Date()) {
	return date.toISOString().slice(0, 10);
}

/**
 * Creates the initial Wallet with a promotional welcome grant and no paid value.
 *
 * @param {string} userId
 * 	Stable authenticated account identifier.
 * @param {number} [now=Date.now()]
 * 	Creation timestamp in milliseconds.
 * @returns {object}
 * 	Fresh Wallet preserving the legacy total-balance contract.
 */
function createWallet(userId, now = Date.now()) {
	return {
		userId,
		balance: DEFAULT_START,
		promotionalBalance: DEFAULT_START,
		purchasedBalance: 0,
		dailyRefill: DEFAULT_DAILY_REFILL,
		cap: DEFAULT_CAP,
		lastRefillDay: dayKey(new Date(now)),
		createdAt: now,
		updatedAt: now
	};
}

/**
 * Normalizes legacy Wallet state before any domain transition.
 *
 * @param {object} wallet
 * 	Persisted Wallet state.
 * @returns {object}
 * 	Wallet with explicit provenance buckets and required defaults.
 */
function normalizeWallet(wallet) {
	wallet.dailyRefill = Number.isFinite(Number(wallet.dailyRefill))
		? Math.max(0, Math.floor(Number(wallet.dailyRefill)))
		: DEFAULT_DAILY_REFILL;
	wallet.cap = Number.isFinite(Number(wallet.cap))
		? Math.max(0, Math.floor(Number(wallet.cap)))
		: DEFAULT_CAP;
	wallet.lastRefillDay ||= dayKey();
	return normalizeWalletBuckets(wallet);
}

/**
 * Applies at most one promotional refill for the current UTC day.
 *
 * @param {object} wallet
 * 	Mutable Wallet state owned by the active transaction.
 * @param {number} [now=Date.now()]
 * 	Timestamp used consistently across this transition.
 * @returns {{added: number}}
 * 	Promotional Perutahs actually added, possibly zero.
 */
function applyDailyRefill(wallet, now = Date.now()) {
	normalizeWallet(wallet);
	const today = dayKey(new Date(now));

	if (wallet.lastRefillDay === today) {
		return { added: 0 };
	}

	const result = creditWalletBucket(wallet, wallet.dailyRefill, "promotional");
	wallet.lastRefillDay = today;
	wallet.updatedAt = now;
	return { added: result.added };
}

module.exports = {
	DEFAULT_DAILY_REFILL,
	DEFAULT_CAP,
	DEFAULT_START,
	createWallet,
	normalizeWallet,
	applyDailyRefill
};
