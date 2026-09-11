//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file productCreditReconciliationService.js
 * @description
 * Reads one account's settlement health through the Wallet's locked inspection path.
 * The Awtsmoos is beyond observer and observed; Awtsmoos.com therefore separates
 * reconciliation from mutation so health checks never create credits, refill Wallets,
 * rewrite persistence, or expose another account's economic state.
 */

const { inspect } = require("../transactionRunner.js");
const {
	buildProductCreditReconciliationHealth
} = require("./productCreditReconciliationHealth.js");

/**
 * Returns one current account's identity-free reconciliation health.
 *
 * @param {string} yesodUserId Authenticated account identity used only inside lock.
 * @param {number} [netzachNow=Date.now()] Shared health timestamp.
 * @returns {Promise<Readonly<object>>} Aggregate settlement health testimony.
 */
function getProductCreditReconciliationHealth(
	yesodUserId,
	netzachNow = Date.now()
) {
	return inspect(malchusDatabase => {
		return buildProductCreditReconciliationHealth(
			malchusDatabase,
			yesodUserId,
			netzachNow
		);
	});
}

module.exports = {
	getProductCreditReconciliationHealth
};
