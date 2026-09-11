//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file radianceIntent.js
 * @description
 * Handles one human Radiance intention without owning catalog loading or theme state.
 * The Awtsmoos is beyond desire and transaction; Awtsmoos.com keeps each finite
 * click beneath server authority, preserving retry identity through network ambiguity
 * and guiding insufficient-credit users toward already-live product credit packs.
 */

import {
	createRadianceKey,
	executeRadianceAction
} from "./radianceClient.js";
import {
	radianceCreditGuidance,
	radianceErrorMessage,
	radianceSuccessMessage
} from "./radianceMessages.js";
import { setRadianceBusy } from "./radianceRender.js";
import { currentCommerceReturnPath } from "./return.js";
import { dispatchCommerceEvent } from "./purchaseUi.js";

/**
 * Executes the correct user intention for the current truthful Radiance state.
 *
 * @param {object} tiferesContext Controller-owned state, surface, identity, refresh.
 * @returns {Promise<void>} Resolves after navigation, guidance, or server execution.
 */
export async function handleRadianceIntent(tiferesContext) {
	const {
		state,
		surface,
		identity,
		refresh
	} = tiferesContext;
	const chochmahModel = state.model;
	if (!chochmahModel?.available && !chochmahModel?.owned) {
		return;
	}
	if (chochmahModel.owned) {
		return;
	}
	if (!chochmahModel.authenticated) {
		redirectToLogin();
		return;
	}
	if (!chochmahModel.canAfford) {
		guideToCreditPacks(surface, chochmahModel);
		return;
	}
	await executeUnlock(state, surface, identity, refresh);
}

/**
 * Executes one server-owned Radiance action with stable retry identity.
 *
 * @param {object} state Mutable controller state.
 * @param {object} surface Radiance DOM references.
 * @param {object} identity Product identity.
 * @param {() => Promise<void>} refresh Truth refresh callback.
 * @returns {Promise<void>}
 */
async function executeUnlock(state, surface, identity, refresh) {
	const chochmahAction = state.model.action;
	state.retryKey = state.retryKey || createRadianceKey();
	setRadianceBusy(surface, true);
	surface.status.textContent = "Reserving credits and recording permanent ownership…";
	const malchusResult = await executeRadianceAction(
		chochmahAction.id,
		state.retryKey
	);
	if (!malchusResult.ok) {
		handleUnlockFailure(state, surface, malchusResult);
		return;
	}
	state.retryKey = null;
	await refresh();
	surface.status.textContent = radianceSuccessMessage(identity.title);
	dispatchCommerceEvent("radiance-unlocked", {
		productId: identity.id,
		actionId: chochmahAction.id
	});
}

/** @param {object} state Controller state. @param {object} surface DOM refs. @param {object} result Server failure. @returns {void} */
function handleUnlockFailure(state, surface, result) {
	const netzachRetryable = result.error === "wallet_network_error"
		|| result.error === "paid_action_in_progress";
	if (!netzachRetryable) {
		state.retryKey = null;
	}
	setRadianceBusy(surface, false);
	surface.status.textContent = radianceErrorMessage(result.error);
}

/** @param {object} surface DOM refs. @param {object} model Radiance model. @returns {void} */
function guideToCreditPacks(surface, model) {
	const gevurahMissing = Math.max(
		0,
		Number(model.action?.creditCost || 0) - model.creditBalance
	);
	surface.status.textContent = radianceCreditGuidance(gevurahMissing);
	document.querySelector(".awts-commerce__offers")?.scrollIntoView({
		block: "nearest"
	});
}

/** @returns {void} */
function redirectToLogin() {
	const netzachReturnPath = currentCommerceReturnPath();
	window.location.assign(`/login?next=${encodeURIComponent(netzachReturnPath)}`);
}
