//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module AwtsmoosCloudMain
 * @description
 * Boots the public Cloud conversion surface from canonical Wallet testimony.
 * Rendering may explain live offers, but no browser code owns price or entitlement truth.
 */

import { bindCloudActions } from "./cloudActions.js";
import { loadCloudData } from "./cloudData.js";
import { buildCloudModel } from "./cloudModel.js";
import {
	renderCloudOffers,
	setCloudStatus
} from "./cloudView.js";

const refs = Object.freeze({
	briefField: document.getElementById("cloudBrief"),
	briefForm: document.getElementById("cloudBriefForm"),
	offersMount: document.getElementById("cloudOffers"),
	status: document.getElementById("cloudStatus")
});
let cloudModel = Object.freeze({ offers: [] });
const retryKeys = new Map();

/**
 * Refreshes live commerce testimony and repaints all reservation cards.
 * @returns {Promise<void>} Resolves after the current server state is visible.
 */
async function refreshCloud() {
	setCloudStatus(refs.status, "Loading live Awtsmoos Cloud offers…", "busy");
	const data = await loadCloudData();
	cloudModel = buildCloudModel(data);
	renderCloudOffers(refs.offersMount, cloudModel);
	setCloudStatus(refs.status, statusMessage(data, cloudModel), statusKind(data, cloudModel));
}

/** Returns concise truthful status after one refresh. */
function statusMessage(data, model) {
	if (!data.catalog?.ok || !data.currency?.ok || !model.offers.length) {
		return "Live Cloud offers are temporarily unavailable. You can still build free with Shliach.";
	}
	if (!model.authenticated) {
		return "Shliach is ready. Sign in only when you want founder-assisted delivery.";
	}
	return `Signed in · ${model.purchasedBalance.toLocaleString()} purchased Perutas available.`;
}

/** Returns the visual status state without inventing financial meaning. */
function statusKind(data, model) {
	if (!data.catalog?.ok || !data.currency?.ok || !model.offers.length) {
		return "error";
	}
	return model.authenticated ? "success" : "neutral";
}

/** Restores only the non-financial project brief after a Wallet funding detour. */
function restorePendingBrief() {
	try {
		const brief = sessionStorage.getItem("awtsmoosCloudBrief");
		if (brief && refs.briefField && !refs.briefField.value) {
			refs.briefField.value = brief;
		}
	} catch (error) {
		return false;
	}
	return true;
}

restorePendingBrief();
bindCloudActions({
	...refs,
	getModel: () => cloudModel,
	onRefresh: refreshCloud,
	retryKeys
});

void refreshCloud().catch(error => {
	setCloudStatus(
		refs.status,
		"Cloud testimony could not load. Build free with Shliach still works; retry reservation later.",
		"error"
	);
	console.error("AWTSMOOS_CLOUD_BOOT_FAILED", error);
});
