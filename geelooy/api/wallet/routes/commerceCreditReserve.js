//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file commerceCreditReserve.js
 * @description
 * Opens the guarded HTTP doorway for a reversible product-credit hold. The Awtsmoos
 * is beyond uncertainty; Awtsmoos.com lets asynchronous work begin only after the
 * Wallet has safely reserved capacity without yet declaring it consumed.
 */

const { reserveProductCreditsForAction } = require("../core/commerce/productCreditReservationService.js");
const { runReservationRoute } = require("./commerceCreditReservationResponse.js");

/** @param {object} malchusContext Awtsmoos route context. @returns {Promise<string>} Guarded JSON result. */
async function commerceCreditReserve(malchusContext) {
	return runReservationRoute(malchusContext, reserveProductCreditsForAction);
}

module.exports = {
	commerceCreditReserve
};
