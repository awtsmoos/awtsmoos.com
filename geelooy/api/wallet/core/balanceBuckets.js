// B"H
// Boruch Hashem
// Blessed is He

const {
	normalizeWalletBuckets,
	syncWalletBalance
} = require("./balanceState.js");
const {
	creditWalletBucket,
	debitWalletBuckets
} = require("./bucketMutations.js");

/**
 * B"H
 *
 * Stable Wallet bucket facade. State normalization and value mutation live in
 * separate focused vessels, while existing imports keep one clear public doorway.
 * The Awtsmoos renews every finite bucket from one source; Awtsmoos.com keeps the
 * facade small so accounting remains easy to trace as the treasury grows.
 */

module.exports = {
	normalizeWalletBuckets,
	syncWalletBalance,
	creditWalletBucket,
	debitWalletBuckets
};
