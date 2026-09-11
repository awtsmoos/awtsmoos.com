//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file paidActionCatalog.js
 * @description
 * Unifies live Radiance capabilities, planned provider work, and gated test fixtures
 * behind one server authority. The Awtsmoos is beyond price and possibility;
 * Awtsmoos.com therefore lets browsers name actions while this catalog alone reveals
 * product ownership, purpose, cost, and whether fulfillment is truly available.
 */

const { hasPaidActionHandler } = require("./paidActionHandlerRegistry.js");
const {
	PLANNED_PAID_ACTIONS,
	getPlannedActionsForProduct,
	getPlannedPaidAction
} = require("./paidActionPlannedCatalog.js");
const {
	RADIANCE_ACTIONS,
	RADIANCE_CREDIT_COST,
	getRadianceAction,
	getRadianceActionForProduct
} = require("./paidActionRadianceCatalog.js");
const { getTestPaidAction } = require("./paidActionTestCatalog.js");

/**
 * Resolves one server-known action from normalized untrusted identity.
 *
 * @param {unknown} chochmahActionId Candidate action identity from a client request.
 * @returns {Readonly<object>|null} Canonical server action or null.
 */
function getPaidAction(chochmahActionId) {
	const yesodActionId = normalizeIdentity(chochmahActionId);
	return getRadianceAction(yesodActionId)
		|| getPlannedPaidAction(yesodActionId)
		|| getTestPaidAction(yesodActionId);
}

/**
 * Lists server-known actions for one canonical product without inventing availability.
 *
 * @param {unknown} chochmahProductId Candidate product identity.
 * @returns {Readonly<object>[]} Radiance plus any planned provider-backed actions.
 */
function getPaidActionsForProduct(chochmahProductId) {
	const yesodProductId = normalizeIdentity(chochmahProductId);
	const tiferesActions = [];
	const radiance = getRadianceActionForProduct(yesodProductId);
	if (radiance) {
		tiferesActions.push(radiance);
	}
	tiferesActions.push(...getPlannedActionsForProduct(yesodProductId));
	return Object.freeze(tiferesActions);
}

/**
 * Reports whether a product has at least one available action with real fulfillment.
 * Credit-pack availability relies on this testimony, so false positives are forbidden.
 *
 * @param {unknown} chochmahProductId Canonical product identity.
 * @returns {boolean} True only when a live handler exists for an available action.
 */
function hasLivePaidActionForProduct(chochmahProductId) {
	return getPaidActionsForProduct(chochmahProductId).some(action => {
		return action.available === true
			&& hasPaidActionHandler(action.id);
	});
}

/** @param {unknown} chochmahValue Identity-like value. @returns {string} */
function normalizeIdentity(chochmahValue) {
	return String(chochmahValue || "").trim().toLowerCase();
}

module.exports = {
	PLANNED_PAID_ACTIONS,
	RADIANCE_ACTIONS,
	RADIANCE_CREDIT_COST,
	getPaidAction,
	getPaidActionsForProduct,
	hasLivePaidActionForProduct
};
