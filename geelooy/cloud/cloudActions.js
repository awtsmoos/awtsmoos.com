//B"H
//Boruch Hashem
//Blessed be He

import { openShliach } from "../shared/shliach/ShliachUrl.js";
import {
	createCloudRetryKey,
	purchaseCloudReservation
} from "./cloudData.js";
import { setCloudStatus } from "./cloudView.js";
import {
	cloudPurchaseError,
	rememberPendingReservation
} from "./cloudActionSupport.js";

/**
 * @module CloudActions
 * @description
 * Binds explicit Awtsmoos Cloud creation and reservation gestures. AI creation stays
 * free to launch; financial mutations remain separate user gestures through Wallet authority.
 */

/**
 * Binds the Cloud brief and offer grid.
 * @param {object} options Trusted DOM, state getter, and refresh callback.
 * @returns {Function} Cleanup callback for both event bindings.
 */
export function bindCloudActions(options) {
	const submit = event => handleBrief(event, options);
	const click = event => handleOffer(event, options);
	options.briefForm?.addEventListener("submit", submit);
	options.offersMount?.addEventListener("click", click);
	return () => {
		options.briefForm?.removeEventListener("submit", submit);
		options.offersMount?.removeEventListener("click", click);
	};
}

/** Launches the canonical Awtsmoos Shliach with the visitor's exact brief. */
function handleBrief(event, options) {
	event.preventDefault();
	const brief = String(options.briefField?.value || "").trim();
	if (!brief) {
		setCloudStatus(options.status, "Describe what you want built first.", "error");
		options.briefField?.focus();
		return;
	}
	const launch = openShliach({
		goal: brief,
		path: "awtsmoos://cloud/new-project",
		projectId: "new Awtsmoos Cloud project",
		surface: "Awtsmoos Cloud",
		sameTab: true
	});
	setCloudStatus(
		options.status,
		launch.opened
			? "Shliach opened with your brief. The same prompt was copied as a fallback."
			: "Prompt copied. Open Shliach and paste it to continue.",
		launch.opened ? "success" : "busy"
	);
}

/** Routes one explicit offer-card gesture into login, Wallet funding, or purchase. */
async function handleOffer(event, options) {
	const button = event.target.closest("[data-cloud-reserve]");
	if (!button || !options.offersMount?.contains(button) || button.disabled) {
		return;
	}
	const offer = options.getModel()?.offers.find(item => item.id === button.dataset.cloudReserve);
	if (!offer) {
		return;
	}

	if (button.dataset.cloudAction === "login") {
		window.location.href = "/login/";
		return;
	}
	if (button.dataset.cloudAction === "fund") {
		rememberPendingReservation(offer.id, options.briefField?.value);
		window.location.href = "/apps/wallet/#buy";
		return;
	}
	if (button.dataset.cloudAction !== "purchase") {
		return;
	}
	await purchaseOffer(button, offer, options);
}

/** Performs one retry-safe server-authoritative reservation purchase. */
async function purchaseOffer(button, offer, options) {
	const retryKey = options.retryKeys.get(offer.id) || createCloudRetryKey();
	options.retryKeys.set(offer.id, retryKey);
	button.disabled = true;
	setCloudStatus(options.status, "Recording your reservation with verified purchased Perutas…", "busy");
	const result = await purchaseCloudReservation(offer.id, retryKey);
	if (result.ok) {
		options.retryKeys.delete(offer.id);
		setCloudStatus(options.status, "Reservation recorded. Your receipt and durable ownership are now in Wallet.", "success");
		await options.onRefresh?.();
		return;
	}
	if (result.error !== "wallet_network_error") {
		options.retryKeys.delete(offer.id);
	}
	button.disabled = false;
	setCloudStatus(options.status, cloudPurchaseError(result.error), "error");
}
