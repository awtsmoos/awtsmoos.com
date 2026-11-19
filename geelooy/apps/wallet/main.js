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

/**
 * Shortest time the refreshing state stays visible. A healthy server can
 * answer in well under a second, and when the balance is unchanged the
 * result text is identical to what was already on screen — without a
 * floor, a successful refresh is indistinguishable from a dead button.
 */
const REFRESH_FEEDBACK_MIN_MS = 1200;

/** Retrieves authenticated balances and presents a definitive loading result. */
async function refreshWallet(render = true) {
	const response = await getWalletJson('/api/wallet/balance');
	if (render) renderWallet(response);
	return response;
}

/** Shows or hides the in-progress state on the Refresh button itself. */
function setRefreshButtonState(refreshing) {
	if (!refreshButton) return;
	refreshButton.disabled = refreshing;
	refreshButton.textContent = refreshing ? 'Refreshing\u2026' : 'Refresh wallet';
}

/** Refreshes independent account balance and product-credit surfaces. */
async function refreshWalletData() {
	const usdValue = document.getElementById('usdValue');
	if (usdValue) usdValue.textContent = 'Refreshing\u2026';
	setRefreshButtonState(true);
	const startedAt = Date.now();
	try {
		const [wallet] = await Promise.all([
			refreshWallet(false),
			bootCreditPortfolio()
		]);
		const remaining = REFRESH_FEEDBACK_MIN_MS - (Date.now() - startedAt);
		if (remaining > 0) {
			await new Promise(resolve => setTimeout(resolve, remaining));
		}
		renderWallet(wallet);
		if (!wallet?.ok) {
			setCheckoutStatus('Wallet could not refresh. Try again.', 'error');
		} else {
			setCheckoutStatus('Wallet refreshed.');
		}
		return wallet;
	} finally {
		setRefreshButtonState(false);
	}
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

refreshButton?.addEventListener('click', () => {
	refreshWalletData().catch(error => {
		console.error('Awtsmoos Wallet refresh failed', error);
		setCheckoutStatus('Wallet could not refresh. Try again.', 'error');
	});
});
paypalButton?.addEventListener('click', beginCheckout);
bindTransfer({ onSuccess: refreshWallet });

bootWallet().catch(error => {
	console.error('Awtsmoos Wallet failed to boot', error);
	showUnavailableWalletPolicy('wallet_network_error');
	setCheckoutStatus('Wallet could not initialize. Refresh to try again.', 'error');
});
