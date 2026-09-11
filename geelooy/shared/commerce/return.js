// B"H
// Boruch Hashem
// Blessed is He

import { postCommerceJson } from "./client.js";

/** Handles PayPal callbacks on any product route without mutating value by GET. */
export async function processCommerceReturn() {
	const params = new URLSearchParams(window.location.search);
	if (params.get("paypalCancel") === "1") {
		cleanCallbackQuery();
		return { handled: true, ok: false, message: "Checkout cancelled. No Perutas were added." };
	}
	if (params.get("paypalReturn") !== "1") {
		return { handled: false, ok: false, message: "" };
	}
	const orderId = params.get("token");
	if (!orderId) {
		cleanCallbackQuery();
		return { handled: true, ok: false, message: "PayPal returned without an order token." };
	}
	const result = await postCommerceJson("/api/wallet/paypal/capture", { orderId });
	if (result.ok) {
		cleanCallbackQuery();
		return {
			handled: true,
			ok: true,
			message: `Added ${Number(result.perutahs || 0).toLocaleString()} purchased Perutas.`
		};
	}
	if (result.error !== "wallet_network_error") {
		cleanCallbackQuery();
	}
	return { handled: true, ok: false, message: paymentError(result.error) };
}

/** Returns a same-site path that reopens commerce after provider or login travel. */
export function currentCommerceReturnPath() {
	const url = new URL(window.location.href);
	for (const key of callbackKeys()) url.searchParams.delete(key);
	url.searchParams.set("commerce", "1");
	return `${url.pathname}${url.search}`;
}

export function shouldOpenCommerce() {
	return new URLSearchParams(window.location.search).get("commerce") === "1";
}

function cleanCallbackQuery() {
	const url = new URL(window.location.href);
	for (const key of callbackKeys()) url.searchParams.delete(key);
	url.searchParams.set("commerce", "1");
	window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
}

function callbackKeys() {
	return ["paypalReturn", "paypalCancel", "token", "PayerID"];
}

function paymentError(error) {
	if (error === "wallet_network_error") return "Payment verification was interrupted. Reload to retry safely.";
	return `Payment verification failed${error ? `: ${error}` : "."}`;
}
