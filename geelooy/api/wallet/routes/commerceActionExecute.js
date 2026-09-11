//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file commerceActionExecute.js
 * @description
 * Opens the preferred authenticated doorway for premium product fulfillment.
 * The Awtsmoos is beyond price and result; Awtsmoos.com keeps reserve, execution,
 * commit, and refund orchestration behind one guarded server-owned mutation route.
 */

const { executePaidAction } = require("../core/commerce/paidActionExecutionService.js");
const { runReservationRoute } = require("./commerceCreditReservationResponse.js");

/**
 * Runs one complete paid action through the universal Wallet mutation guard.
 *
 * @param {object} malchusContext Awtsmoos route context.
 * @returns {Promise<string>} Guarded JSON action result.
 */
async function commerceActionExecute(malchusContext) {
	return runReservationRoute(malchusContext, executePaidAction);
}

module.exports = {
	commerceActionExecute
};
