//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file radianceModel.js
 * @description
 * Joins public server capability testimony with private account ownership and product
 * credits. The Awtsmoos is beyond price and possession; Awtsmoos.com keeps those
 * finite witnesses separate until this pure browser model renders one truthful state.
 */

/**
 * Builds one immutable Radiance view model for the current canonical product.
 *
 * @param {object} chochmahIdentity Current route product identity.
 * @param {object} binahActions Public capability catalog response.
 * @param {object} yesodCommerce Authenticated commerce account response.
 * @returns {Readonly<object>} UI-safe Radiance state.
 */
export function buildRadianceModel(chochmahIdentity, binahActions, yesodCommerce) {
	const tiferesAction = findRadianceAction(
		chochmahIdentity.id,
		binahActions?.actions || []
	);
	const malchusAuthenticated = yesodCommerce?.ok === true;
	const malchusOwned = isRadianceOwnedForProduct(
		chochmahIdentity.id,
		yesodCommerce?.entitlements || []
	);
	const netzachCredits = productCreditBalance(
		chochmahIdentity.id,
		yesodCommerce?.productCredits || []
	);
	return Object.freeze({
		action: tiferesAction,
		authenticated: malchusAuthenticated,
		available: Boolean(tiferesAction),
		owned: malchusOwned,
		creditBalance: netzachCredits,
		canAfford: Boolean(tiferesAction)
			&& netzachCredits >= Number(tiferesAction.creditCost || 0)
	});
}

/**
 * Finds the current product's live Radiance action from public server testimony.
 *
 * @param {string} yesodProductId Canonical product identity.
 * @param {Readonly<object>[]} chochmahActions Public live paid actions.
 * @returns {object|null} Current product Radiance action or null.
 */
export function findRadianceAction(yesodProductId, chochmahActions) {
	return chochmahActions.find(action => {
		return action.productId === yesodProductId
			&& action.purpose === "radiance_unlock";
	}) || null;
}

/**
 * Detects permanent Radiance ownership directly from the canonical product identity.
 *
 * @param {string} yesodProductId Canonical product identity.
 * @param {Readonly<object>[]} binahEntitlements Private account entitlements.
 * @returns {boolean} True only when durable account testimony owns this Radiance.
 */
export function isRadianceOwnedForProduct(yesodProductId, binahEntitlements) {
	const netzachSkuId = `action:${yesodProductId}.radiance.unlock`;
	return binahEntitlements.some(entitlement => entitlement.skuId === netzachSkuId);
}

/**
 * Finds the current product's available credit balance.
 *
 * @param {string} yesodProductId Canonical product identity.
 * @param {Readonly<object>[]} chochmahCredits Account product-credit projections.
 * @returns {number} Safe non-negative whole credit balance.
 */
export function productCreditBalance(yesodProductId, chochmahCredits) {
	const binahCredit = chochmahCredits.find(credit => credit.productId === yesodProductId);
	const gevurahBalance = Math.floor(Number(binahCredit?.balance || 0));
	return Number.isFinite(gevurahBalance)
		? Math.max(0, gevurahBalance)
		: 0;
}
