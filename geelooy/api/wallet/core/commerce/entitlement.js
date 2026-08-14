// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("crypto");

/**
 * B"H
 *
 * Owns durable entitlement records, the finite proof that a purchased product
 * belongs to one Awtsmoos.com account. The Awtsmoos renews owner and owned thing
 * from one source; this record merely preserves the useful relationship in time.
 */

/**
 * Creates one durable entitlement record.
 *
 * @param {string} userId
 * 	Authenticated account identifier.
 * @param {object} sku
 * 	Server-known SKU being granted.
 * @param {number} [now=Date.now()]
 * 	Grant timestamp.
 * @returns {object}
 * 	Durable entitlement record.
 */
function createEntitlement(userId, sku, now = Date.now()) {
	return Object.freeze({
		id: "ent_" + crypto.randomBytes(8).toString("hex"),
		userId,
		skuId: sku.id,
		productId: sku.productId,
		key: sku.entitlementKey,
		grantedAt: now
	});
}

/**
 * Returns all durable entitlements belonging to one account.
 *
 * @param {object} database
 * 	Wallet database state.
 * @param {string} userId
 * 	Authenticated account identifier.
 * @returns {object[]}
 * 	Copy of the account entitlement list.
 */
function listEntitlements(database, userId) {
	return [...(database.entitlements[userId] || [])];
}

/**
 * Tests whether an account already owns the durable SKU entitlement.
 *
 * @param {object} database
 * 	Wallet database state.
 * @param {string} userId
 * 	Authenticated account identifier.
 * @param {object} sku
 * 	Server-known durable SKU.
 * @returns {object|null}
 * 	Existing entitlement or null.
 */
function findEntitlement(database, userId, sku) {
	return listEntitlements(database, userId).find(entitlement => {
		return entitlement.key === sku.entitlementKey;
	}) || null;
}

/**
 * Adds a durable entitlement to the account collection.
 *
 * @param {object} database
 * 	Mutable Wallet database owned by the transaction lock.
 * @param {object} entitlement
 * 	Entitlement record to persist.
 */
function grantEntitlement(database, entitlement) {
	database.entitlements[entitlement.userId] ||= [];
	database.entitlements[entitlement.userId].push(entitlement);
}

module.exports = {
	createEntitlement,
	listEntitlements,
	findEntitlement,
	grantEntitlement
};
