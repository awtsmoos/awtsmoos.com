//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file radianceRefresh.js
 * @description
 * Synchronizes public capability truth, private ownership, product-credit balance,
 * and the owned visual projection without handling click intention. The Awtsmoos is
 * beyond every refresh; Awtsmoos.com lets each finite re-read replace browser memory
 * with current server testimony before drawing price, ownership, or affordability.
 */

import {
	loadRadianceActions,
	loadRadianceOwnership
} from "./radianceClient.js";
import {
	buildRadianceModel,
	isRadianceOwnedForProduct
} from "./radianceModel.js";
import {
	renderRadiance,
	setRadianceBusy
} from "./radianceRender.js";
import { applyRadianceTheme } from "./radianceTheme.js";

/**
 * Loads only private ownership during initial page boot so owned Radiance can appear
 * without eagerly loading the entire public action catalog before the store opens.
 *
 * @param {object} yesodState Mutable controller state.
 * @param {object} chochmahIdentity Current canonical product identity.
 * @returns {Promise<void>} Resolves after durable ownership is projected.
 */
export async function primeRadianceOwnership(yesodState, chochmahIdentity) {
	yesodState.commerce = await loadRadianceOwnership();
	const malchusOwned = isRadianceOwnedForProduct(
		chochmahIdentity.id,
		yesodState.commerce?.entitlements || []
	);
	applyRadianceTheme(chochmahIdentity.id, malchusOwned);
}

/**
 * Reloads live action and account testimony whenever the commerce dialog is opened.
 *
 * @param {object} yesodState Mutable controller state.
 * @param {object} malchusSurface Radiance DOM references.
 * @param {object} chochmahIdentity Current canonical product identity.
 * @returns {Promise<void>} Resolves after panel and owned theme match server truth.
 */
export async function refreshRadiance(
	yesodState,
	malchusSurface,
	chochmahIdentity
) {
	const [binahActions, yesodCommerce] = await Promise.all([
		loadRadianceActions(),
		loadRadianceOwnership()
	]);
	yesodState.actions = binahActions;
	yesodState.commerce = yesodCommerce;
	yesodState.model = buildRadianceModel(
		chochmahIdentity,
		binahActions,
		yesodCommerce
	);
	setRadianceBusy(malchusSurface, false);
	renderRadiance(malchusSurface, yesodState.model, chochmahIdentity);
	applyRadianceTheme(chochmahIdentity.id, yesodState.model.owned);
}

/**
 * Refreshes the open store fully after a credit purchase or otherwise re-primes only
 * private ownership when the sheet is closed, preserving the lazy-load boundary.
 *
 * @param {object} yesodState Mutable controller state.
 * @param {object} malchusSurface Radiance DOM references.
 * @param {object} chochmahIdentity Current product identity.
 * @param {HTMLDialogElement} malchusDialog Existing commerce dialog.
 * @returns {Promise<void>} Resolves after appropriate truth refresh.
 */
export async function refreshRadianceAfterPurchase(
	yesodState,
	malchusSurface,
	chochmahIdentity,
	malchusDialog
) {
	if (malchusDialog.open) {
		await refreshRadiance(
			yesodState,
			malchusSurface,
			chochmahIdentity
		);
		return;
	}
	await primeRadianceOwnership(yesodState, chochmahIdentity);
}
