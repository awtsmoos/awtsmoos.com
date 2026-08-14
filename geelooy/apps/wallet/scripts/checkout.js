// B"H
// Boruch Hashem
// Blessed is He

import { postWalletJson } from "./client.js";
import { setCheckoutStatus } from "./view.js";

/**
 * B"H
 *
 * Owns the browser checkout journey: create, approve, return, verify, and clean
 * callback state. The Awtsmoos renews departure and return without losing the
 * traveler; Awtsmoos.com turns provider approval into an explicit POST verification
 * instead of letting a side-effecting GET URL mutate the treasury.
 */

/**
 * Removes PayPal callback parameters after terminal handling.
 */
function clearCheckoutQuery() {
	const url = new URL(window.location.href);

	for (const key of ["paypalReturn", "paypalCancel", "token", "PayerID"]) {
		url.searchParams.delete(key);
	}

	window.history.replaceState({}, "", url.pathname + url.search + url.hash);
}

/**
 * Processes a PayPal approval/cancel callback already present in the current URL.
 *
 * @returns {Promise<{handled: boolean, captured: boolean}>}
 * 	Whether a callback existed and whether it produced a successful credit.
 */
export async function processCheckoutReturn() {
	const parameters = new URLSearchParams(window.location.search);

	if (parameters.get("paypalCancel") === "1") {
		setCheckoutStatus("PayPal checkout was cancelled. No Wallet credit was created.");
		clearCheckoutQuery();
		return { handled: true, captured: false };
	}

	if (parameters.get("paypalReturn") !== "1") {
		return { handled: false, captured: false };
	}

	const orderId = parameters.get("token");

	if (!orderId) {
		setCheckoutStatus("PayPal returned without an order token.", "error");
		clearCheckoutQuery();
		return { handled: true, captured: false };
	}

	setCheckoutStatus("Verifying the completed PayPal order…");
	const result = await postWalletJson(
		"/api/wallet/paypal/capture",
		{ orderId }
	);

	if (!result.ok) {
		setCheckoutStatus(
			`Payment verification failed: ${result.error || "unknown error"}`,
			"error"
		);
		return { handled: true, captured: false };
	}

	setCheckoutStatus(
		`Added ${result.perutahs} purchased Perutahs from $${Number(result.dollars).toFixed(2)}.`,
		"success"
	);
	clearCheckoutQuery();
	return { handled: true, captured: true };
}

/**
 * Creates a PayPal order and navigates to its provider approval URL.
 *
 * @param {number|string} dollars
 * 	Requested USD amount from the Wallet form.
 * @returns {Promise<boolean>}
 * 	True when browser navigation was initiated.
 */
export async function startPayPalCheckout(dollars) {
	setCheckoutStatus("Creating a secure PayPal order…");
	const result = await postWalletJson(
		"/api/wallet/paypal/create",
		{ dollars }
	);

	if (!result.ok) {
		setCheckoutStatus(
			`Could not create checkout: ${result.error || "unknown error"}`,
			"error"
		);
		return false;
	}

	const approvalUrl = result.order?.links?.find(link => link.rel === "approve")?.href;

	if (!approvalUrl) {
		setCheckoutStatus("PayPal did not return an approval link.", "error");
		return false;
	}

	window.location.assign(approvalUrl);
	return true;
}
