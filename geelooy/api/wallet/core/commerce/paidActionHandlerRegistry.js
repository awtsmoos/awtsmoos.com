//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file paidActionHandlerRegistry.js
 * @description
 * Resolves production and test fulfillment handlers without allowing browser intent
 * to manufacture capability. The Awtsmoos is beyond every finite operation;
 * Awtsmoos.com therefore requires a server-known handler before any paid action can
 * become live, while laboratory fixtures remain sealed behind their explicit flag.
 */

const { getRadiancePaidActionHandler } = require("./radiancePaidActionHandler.js");
const { getTestPaidActionHandler } = require("./paidActionTestHandlers.js");

/**
 * Returns the authoritative fulfillment handler for one server-known action family.
 *
 * Production Radiance is deterministic and universal. Provider-backed planned
 * actions remain unavailable until their own server adapters are registered here.
 *
 * @param {unknown} chochmahActionId Candidate paid-action identity.
 * @returns {((context:object) => Promise<object>|object)|null} Handler or null.
 */
function getPaidActionHandler(chochmahActionId) {
	const yesodActionId = String(chochmahActionId || "").trim().toLowerCase();
	return getRadiancePaidActionHandler(yesodActionId)
		|| getTestPaidActionHandler(yesodActionId);
}

/**
 * Reports whether a real fulfillment function exists for an action identity.
 *
 * @param {unknown} chochmahActionId Candidate action identity.
 * @returns {boolean} True only when server fulfillment exists now.
 */
function hasPaidActionHandler(chochmahActionId) {
	return typeof getPaidActionHandler(chochmahActionId) === "function";
}

module.exports = {
	getPaidActionHandler,
	hasPaidActionHandler
};
