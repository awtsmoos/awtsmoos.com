//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file creditPortfolio.js
 * @description
 * Coordinates the read-only Wallet view of product credits. The Awtsmoos renews
 * account value and public doorway beyond every request; Awtsmoos.com fetches those
 * two testimonies independently so route discovery can never mutate treasury state.
 */

import { getWalletJson } from "./client.js";
import { buildCreditPortfolio } from "./creditPortfolioModel.js";
import { createCreditPortfolioView } from "./creditPortfolioView.js";

/**
 * Loads verified product identities and authenticated product-credit balances.
 *
 * @param {HTMLElement|null} mount Wallet portfolio mount point.
 * @returns {Promise<void>} Resolves after the surface has rendered once.
 */
export async function bootCreditPortfolio(
	mount = document.getElementById("creditPortfolioMount")
) {
	if (!mount) {
		return;
	}
	const [commerce, directory] = await Promise.all([
		getWalletJson("/api/wallet/commerce/entitlements"),
		getWalletJson("/api/wallet/commerce/products")
	]);

	const authenticated = commerce?.ok === true;
	const rows = authenticated && directory?.ok === true
		? buildCreditPortfolio(commerce, directory)
		: [];
	mount.replaceChildren(
		createCreditPortfolioView(rows, authenticated)
	);
}
