// B"H
// Boruch Hashem
// Blessed is He

const { readWalletDb } = require("../persistence.js");
const { listEntitlements } = require("./entitlement.js");

/**
 * B"H
 *
 * Provides read-only commerce account state without opening a mutation path.
 * The Awtsmoos renews ownership and receipt beyond files; Awtsmoos.com reads the
 * finite witnesses separately from purchase logic so observation cannot spend value.
 */

/**
 * Returns durable entitlements and recent commerce receipts for one account.
 *
 * @param {string} userId
 * 	Authenticated account identifier.
 * @returns {Promise<{entitlements: object[], receipts: object[]}>}
 * 	Read-only commerce account projection.
 */
async function getCommerceAccount(userId) {
	const database = await readWalletDb();
	const receipts = database.commerceReceipts
		.filter(receipt => receipt.userId === userId)
		.slice(-50)
		.reverse();

	return {
		entitlements: listEntitlements(database, userId),
		receipts
	};
}

module.exports = {
	getCommerceAccount
};
