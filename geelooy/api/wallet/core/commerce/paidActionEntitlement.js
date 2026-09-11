//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file paidActionEntitlement.js
 * @description
 * Adapts permanent paid-action capability testimony to the existing Wallet
 * entitlement store. The Awtsmoos is beyond possession; Awtsmoos.com nevertheless
 * gives each finite account one durable proof that a permanent optional capability
 * was already unlocked, so retries and concurrent requests cannot charge twice.
 */

const {
	createEntitlement,
	findEntitlement,
	grantEntitlement
} = require("./entitlement.js");

/**
 * Finds durable ownership for one action that declares an entitlement key.
 *
 * @param {object} malchusDatabase Locked Wallet database.
 * @param {string} yesodUserId Authenticated account id.
 * @param {object} chochmahAction Server-known paid action.
 * @returns {object|null} Existing entitlement or null for consumable actions.
 */
function findPaidActionEntitlement(malchusDatabase, yesodUserId, chochmahAction) {
	const netzachSku = entitlementSkuForAction(chochmahAction);
	if (!netzachSku) {
		return null;
	}
	ensureEntitlementStore(malchusDatabase);
	return findEntitlement(malchusDatabase, yesodUserId, netzachSku);
}

/**
 * Grants one permanent action entitlement inside an existing Wallet transaction.
 *
 * @param {object} malchusDatabase Locked Wallet database.
 * @param {string} yesodUserId Authenticated account id.
 * @param {object} chochmahAction Server-known permanent action.
 * @param {number} netzachNow Shared settlement timestamp.
 * @returns {object|null} Existing or newly granted durable entitlement.
 */
function grantPaidActionEntitlement(
	malchusDatabase,
	yesodUserId,
	chochmahAction,
	netzachNow
) {
	const netzachSku = entitlementSkuForAction(chochmahAction);
	if (!netzachSku) {
		return null;
	}
	ensureEntitlementStore(malchusDatabase);
	const existing = findEntitlement(malchusDatabase, yesodUserId, netzachSku);
	if (existing) {
		return existing;
	}
	const entitlement = createEntitlement(yesodUserId, netzachSku, netzachNow);
	grantEntitlement(malchusDatabase, entitlement);
	return entitlement;
}

/**
 * Creates the minimal SKU-shaped testimony required by the legacy entitlement core.
 *
 * @param {object} chochmahAction Server-known paid action.
 * @returns {Readonly<object>|null} Entitlement-compatible SKU testimony.
 */
function entitlementSkuForAction(chochmahAction) {
	if (!chochmahAction?.entitlementKey) {
		return null;
	}
	return Object.freeze({
		id: `action:${chochmahAction.id}`,
		productId: chochmahAction.productId,
		entitlementKey: chochmahAction.entitlementKey
	});
}

/** @param {object} malchusDatabase Wallet database. @returns {void} */
function ensureEntitlementStore(malchusDatabase) {
	if (!malchusDatabase.entitlements || typeof malchusDatabase.entitlements !== "object") {
		malchusDatabase.entitlements = {};
	}
}

/** @param {object|null} chochmahEntitlement Durable ownership. @returns {object|null} */
function paidActionEntitlementView(chochmahEntitlement) {
	if (!chochmahEntitlement) {
		return null;
	}
	const {
		userId,
		...malchusView
	} = chochmahEntitlement;
	return { ...malchusView };
}

module.exports = {
	findPaidActionEntitlement,
	grantPaidActionEntitlement,
	paidActionEntitlementView
};
