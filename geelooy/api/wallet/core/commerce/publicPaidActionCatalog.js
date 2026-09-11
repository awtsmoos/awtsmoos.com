//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file publicPaidActionCatalog.js
 * @description
 * Projects server-owned paid capabilities into a customer-safe read model. The
 * Awtsmoos is beyond price and fulfillment detail; Awtsmoos.com reveals only the
 * finite testimony a product interface needs to explain real value without exposing
 * handler internals, entitlement keys, or future unavailable provider machinery.
 */

const {
	discoverProducts,
	supporterProductId
} = require("./platform/productDiscovery.js");
const {
	getPaidActionsForProduct
} = require("./paidActionCatalog.js");
const { hasPaidActionHandler } = require("./paidActionHandlerRegistry.js");

/**
 * Lists every currently available handler-backed public paid capability.
 *
 * @returns {Readonly<object>[]} Frozen customer-safe action testimony.
 */
function listPublicPaidActions() {
	const tiferesActions = [];
	for (const product of discoverProducts()) {
		const yesodProductId = supporterProductId(product);
		for (const action of getPaidActionsForProduct(yesodProductId)) {
			if (!isPublicLiveAction(action)) {
				continue;
			}
			tiferesActions.push(publicPaidActionView(action));
		}
	}
	return Object.freeze(tiferesActions);
}

/**
 * Restricts public visibility to actions that can actually fulfill now.
 *
 * @param {object} chochmahAction Server-known paid action.
 * @returns {boolean} True only for live handler-backed capabilities.
 */
function isPublicLiveAction(chochmahAction) {
	return chochmahAction?.available === true
		&& hasPaidActionHandler(chochmahAction.id);
}

/**
 * Removes settlement-only and internal entitlement testimony from an action.
 *
 * @param {object} chochmahAction Server-known live action.
 * @returns {Readonly<object>} Immutable customer-safe action projection.
 */
function publicPaidActionView(chochmahAction) {
	return Object.freeze({
		id: chochmahAction.id,
		productId: chochmahAction.productId,
		creditCost: chochmahAction.creditCost,
		purpose: chochmahAction.purpose,
		title: chochmahAction.title || chochmahAction.id,
		description: chochmahAction.description || "Premium product capability.",
		fulfillmentKind: chochmahAction.fulfillmentKind || "consumable"
	});
}

module.exports = {
	listPublicPaidActions,
	publicPaidActionView
};
