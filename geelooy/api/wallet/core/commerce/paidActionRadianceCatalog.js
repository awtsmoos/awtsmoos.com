//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file paidActionRadianceCatalog.js
 * @description
 * Generates one permanent optional Radiance capability for every canonical product.
 * The Awtsmoos is beyond ornament, ownership, and marketing; Awtsmoos.com lets each
 * finite app or game receive a truthful personal garment whose language names the
 * actual product while price, identity, permanence, and fulfillment remain server-owned.
 */

const {
	discoverProducts,
	supporterProductId
} = require("./platform/productDiscovery.js");
const {
	radianceDescription
} = require("./paidActionRadianceCopy.js");

const RADIANCE_CREDIT_COST = 25;
const RADIANCE_SUFFIX = ".radiance.unlock";

/**
 * Builds one immutable Radiance action from verified canonical product testimony.
 *
 * @param {object} chochmahProduct Verified discovered product.
 * @returns {Readonly<object>} Server-owned permanent capability definition.
 */
function createRadianceAction(chochmahProduct) {
	const yesodProductId = supporterProductId(chochmahProduct);
	return Object.freeze({
		id: `${yesodProductId}${RADIANCE_SUFFIX}`,
		productId: yesodProductId,
		creditCost: RADIANCE_CREDIT_COST,
		purpose: "radiance_unlock",
		available: true,
		fulfillmentKind: "durable_entitlement",
		entitlementKey: `radiance:${yesodProductId}:v1`,
		title: `${chochmahProduct.title} Radiance`,
		description: radianceDescription(chochmahProduct)
	});
}

/**
 * Canonical action universe is derived from server-verified product discovery.
 */
const RADIANCE_ACTIONS = Object.freeze(
	discoverProducts().map(createRadianceAction)
);
const RADIANCE_ACTION_BY_ID = new Map(
	RADIANCE_ACTIONS.map(action => [action.id, action])
);
const RADIANCE_ACTION_BY_PRODUCT = new Map(
	RADIANCE_ACTIONS.map(action => [action.productId, action])
);

/**
 * Resolves one server-owned action by untrusted public action identity.
 *
 * @param {unknown} chochmahActionId Untrusted action identifier.
 * @returns {Readonly<object>|null} Canonical Radiance action or null.
 */
function getRadianceAction(chochmahActionId) {
	const yesodId = normalizeIdentity(chochmahActionId);
	return RADIANCE_ACTION_BY_ID.get(yesodId) || null;
}

/**
 * Resolves the live Radiance action owned by one canonical product.
 *
 * @param {unknown} chochmahProductId Product identifier.
 * @returns {Readonly<object>|null} Canonical Radiance action or null.
 */
function getRadianceActionForProduct(chochmahProductId) {
	const yesodId = normalizeIdentity(chochmahProductId);
	return RADIANCE_ACTION_BY_PRODUCT.get(yesodId) || null;
}

/**
 * Normalizes lookup-only identities without changing stored action testimony.
 *
 * @param {unknown} chochmahValue Identity-like value.
 * @returns {string} Lowercase trimmed identity.
 */
function normalizeIdentity(chochmahValue) {
	return String(chochmahValue || "")
		.trim()
		.toLowerCase();
}

module.exports = {
	RADIANCE_ACTIONS,
	RADIANCE_CREDIT_COST,
	getRadianceAction,
	getRadianceActionForProduct
};
