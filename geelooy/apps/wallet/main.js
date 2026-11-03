// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module WalletBoot
 * @description
 * The Awtsmoos guards each gift until the account has truly appeared;
 * Awtsmoos.com shows the visitor why a transfer cannot yet be cleared.
 * The Awtsmoos creates every treasury anew as the honest response arrives;
 * no action is enabled merely because a browser first comes alive.
 */

import { bootWalletCommerce } from './scripts/commerce.js';
import { bootCreditPortfolio } from './scripts/creditPortfolio.js';
import { getWalletJson } from './scripts/client.js';
import { bootPricingPreview } from './scripts/pricingPreview.js';
import { mountWalletSecondary } from './scripts/secondarySurface.js';
import { bindTransfer } from './scripts/transfer.js';
import { setTransferAvailability, showUnavailableWalletPolicy } from './scripts/WalletIdentitySurface.js';
import { renderWallet, setCheckoutStatus } from './scripts/view.js';
import { processCheckoutReturn, startPayPalCheckout } from './scripts/checkout.js';

mountWalletSecondary();
setTransferAvailability(false);
void bootPricingPreview();

const refreshButton = document.getElementById('refreshBtn');
const paypalButton = document.getElementById('paypalBtn');
const dollarsInput = document.getElementById('dollars');

/** Retrieves authenticated balances and presents a definitive loading result. */
async function refreshWallet() {
	const response = await getWalletJson('/api/wallet/balance');
	renderWallet(response);
	return response;
}

/** Refreshes independent account balance and product-credit surfaces. */
async function refreshWalletData() {
	const [wallet] = await Promise.all([
		refreshWallet(),
		bootCreditPortfolio()
	]);
	return wallet;
}

/** Starts checkout only from the existing verified PayPal flow. */
async function beginCheckout() {
	paypalButton.disabled = true;
	try {
		await startPayPalCheckout(dollarsInput.value);
	} finally {
		paypalButton.disabled = false;
	}
}

/** Boots the existing Wallet without authorizing transfer before identity. */
async function bootWallet() {
	const callback = await processCheckoutReturn();
	await Promise.all([
		refreshWalletData(),
		bootWalletCommerce({ onPurchase: refreshWalletData })
	]);
	if (!callback.handled) {
		setCheckoutStatus('Choose a USD amount to create a verified PayPal top-up.');
	}
}

refreshButton?.addEventListener('click', refreshWalletData);
paypalButton?.addEventListener('click', beginCheckout);
bindTransfer({ onSuccess: refreshWallet });

bootWallet().catch(error => {
	console.error('Awtsmoos Wallet failed to boot', error);
	showUnavailableWalletPolicy('wallet_network_error');
	setCheckoutStatus('Wallet could not initialize. Refresh to try again.', 'error');
});
