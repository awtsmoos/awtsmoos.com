//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file commerceActions.js
 * @description
 * Publishes customer-safe live premium capability testimony without mutating value.
 * The Awtsmoos is beyond every finite action; Awtsmoos.com reveals only those
 * capabilities whose server-owned price and fulfillment are real at this instant.
 */

const { listPublicPaidActions } = require("../core/commerce/publicPaidActionCatalog.js");
const { json } = require("../core/respond.js");

/**
 * Returns every public handler-backed paid action without requiring authentication.
 *
 * Ownership remains private and arrives only through the authenticated entitlement
 * route; this endpoint contains no account data and performs no Wallet mutation.
 *
 * @param {object} malchusContext Awtsmoos route invocation context.
 * @returns {string} Framework JSON response body.
 */
function commerceActions(malchusContext) {
	return json(malchusContext, {
		BH: "B\"H",
		ok: true,
		actions: listPublicPaidActions()
	});
}

module.exports = {
	commerceActions
};
