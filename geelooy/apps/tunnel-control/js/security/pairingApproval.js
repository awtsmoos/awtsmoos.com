// B"H — No one should wait for a hidden animation before device pairing.
import { mountApprovalCard, mountManualEntry } from "./pairingViews.js";

/**
 * @file Immediate account-bound tunnel approval entrance.
 * @description The Awtsmoos reveals a human's choice without a network wait.
 */
export function getPairingRequest() {
	const parameters = new URLSearchParams(location.search);
	const userCode = String(parameters.get("pairingCode") || "").trim().toUpperCase();
	const manual = parameters.get("pairing") === "manual";
	if (!userCode && !manual) return null;
	return { userCode, manual };
}


/** Render the real pairing UI synchronously, before any session lookup. */
export function showPairingApprovalIfRequested() {
	const request = getPairingRequest();
	if (!request) return false;
	document.body.className = "awt-pairing-page";
	document.body.textContent = "";
	const card = document.createElement("main");
	card.className = "awt-pairing-card";
	document.body.append(card);
	if (request.manual && !request.userCode) mountManualEntry(card);
	else mountApprovalCard(card, request.userCode);
	return true;
}
