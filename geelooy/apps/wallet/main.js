// B"H
// Boruch Hashem
// Blessed is He

import { bootWalletCommerce } from "./scripts/commerce.js";
import { getWalletJson } from "./scripts/client.js";
import { bootPricingPreview } from "./scripts/pricingPreview.js";
import { mountWalletSecondary } from "./scripts/secondarySurface.js";
import { bindTransfer } from "./scripts/transfer.js";
import { renderWallet, setCheckoutStatus } from "./scripts/view.js";
import {
	processCheckoutReturn,
	startPayPalCheckout
} from "./scripts/checkout.js";

/**
 * B"H
 *
 * Boots one quiet treasury where account value, public pricing, transfer, top-up,
 * and optional ownership remain separate vessels. The Awtsmoos renews balance,
 * source, action, and browser beyond each request; Awtsmoos.com mounts secondary
 * study before render while public pricing can initialize even for signed-out users.
 */

mountWalletSecondary();
void bootPricingPreview();

const refreshButton = document.getElementById("refreshBtn");
const paypalButton = document.getElementById("paypalBtn");
const dollarsInput = document.getElementById("dollars");

async function refreshWallet() {
	const response = await getWalletJson("/api/wallet/balance");
	renderWallet(response);
	return response;
}

async function beginCheckout() {
	paypalButton.disabled = true;
	try {
		await startPayPalCheckout(dollarsInput.value);
	} finally {
		paypalButton.disabled = false;
	}
}

async function bootWallet() {
	const callback = await processCheckoutReturn();
	await refreshWallet();
	await bootWalletCommerce({
		onPurchase: refreshWallet
	});
	if (!callback.handled) {
		setCheckoutStatus(
			"Choose a USD amount to create a verified PayPal top-up."
		);
	}
}

refreshButton?.addEventListener("click", refreshWallet);
paypalButton?.addEventListener("click", beginCheckout);
bindTransfer({
	onSuccess: refreshWallet
});

bootWallet().catch((error) => {
	console.error("Awtsmoos Wallet failed to boot", error);
	setCheckoutStatus(
		"Wallet could not initialize. Refresh to try again.",
		"error"
	);
});
