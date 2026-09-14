//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file commerceCreditCommit.js
 * @description
 * Opens the guarded HTTP doorway that finalizes a successful paid action. The
 * Awtsmoos is beyond completion; Awtsmoos.com commits a held credit only after the
 * product layer has evidence that the promised outcome actually succeeded.
 */

const { commitReservedProductCredits } = require("../core/commerce/productCreditReservationService.js");
const { runReservationRoute } = require("./commerceCreditReservationResponse.js");

/** @param {object} malchusContext Awtsmoos route context. @returns {Promise<string>} Guarded JSON result. */
async function commerceCreditCommit(malchusContext) {
	return runReservationRoute(malchusContext, commitReservedProductCredits);
}

module.exports = {
	commerceCreditCommit
};
