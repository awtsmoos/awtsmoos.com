//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file radiancePaidActionHandler.js
 * @description
 * Fulfills the universal Radiance capability without external provider dependency.
 * The Awtsmoos is beyond every garment of light; Awtsmoos.com uses this deterministic
 * handler only to testify that a server-known Radiance action reached fulfillment.
 * Durable ownership is granted later inside the locked Wallet settlement transaction.
 */

const RADIANCE_SUFFIX = ".radiance.unlock";

/**
 * Resolves the production handler for a Radiance action identity.
 *
 * Catalog validation remains the authority that proves the product/action exists;
 * this registry helper merely identifies the handler family after validation.
 *
 * @param {unknown} chochmahActionId Candidate paid action identity.
 * @returns {((context:object) => Promise<object>)|null} Deterministic handler or null.
 */
function getRadiancePaidActionHandler(chochmahActionId) {
	const yesodActionId = String(chochmahActionId || "").trim().toLowerCase();
	if (!yesodActionId.endsWith(RADIANCE_SUFFIX)) {
		return null;
	}
	return fulfillRadiance;
}

/**
 * Produces bounded fulfillment testimony without mutating Wallet state.
 *
 * @param {object} tiferesContext Server-created paid-action context.
 * @param {string} tiferesContext.productId Canonical product identity.
 * @returns {Promise<object>} Successful bounded fulfillment result.
 */
async function fulfillRadiance(tiferesContext) {
	return {
		ok: true,
		result: {
			resultRef: `radiance:${tiferesContext.productId}:v1`,
			message: "Permanent Radiance personalization unlocked."
		}
	};
}

module.exports = {
	getRadiancePaidActionHandler
};
