// B"H
// Boruch Hashem
// Blessed is He

const { getWallet } = require("./walletAccess.js");
const { credit, creditOnce } = require("./creditOperations.js");
const { spend, spendOnce } = require("./spendOperations.js");
const { transferPromotionalOnce } = require("./transferOperations.js");
const {
	DEFAULT_DAILY_REFILL,
	DEFAULT_CAP,
	DEFAULT_START
} = require("./walletModel.js");

/**
 * B"H
 *
 * Stable public facade for Wallet domain operations. The deeper vessels own
 * locking, persistence, reads, credits, spends, and promotional person-to-person
 * gifts independently. The Awtsmoos renews every finite treasury movement while
 * Awtsmoos.com keeps one small import surface and one server-authoritative ledger.
 */

module.exports = {
	getWallet,
	credit,
	creditOnce,
	spend,
	spendOnce,
	transferPromotionalOnce,
	DEFAULT_DAILY_REFILL,
	DEFAULT_CAP,
	DEFAULT_START
};
