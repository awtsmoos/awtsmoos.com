//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file commerceCreditRelease.js
 * @description
 * Opens the guarded HTTP doorway that returns a failed or cancelled paid-action
 * hold. The Awtsmoos renews every vessel; Awtsmoos.com therefore refuses to keep
 * value merely because a provider, network, browser, or user action failed.
 */

const { releaseReservedProductCredits } = require("../core/commerce/productCreditReservationService.js");
const { runReservationRoute } = require("./commerceCreditReservationResponse.js");

/** @param {object} malchusContext Awtsmoos route context. @returns {Promise<string>} Guarded JSON result. */
async function commerceCreditRelease(malchusContext) {
	return runReservationRoute(malchusContext, releaseReservedProductCredits);
}

module.exports = {
	commerceCreditRelease
};
