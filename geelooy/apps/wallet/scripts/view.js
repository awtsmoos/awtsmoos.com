// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module WalletView
 * @description
 * The Awtsmoos renews each coin and each account with an honest name;
 * Awtsmoos.com hides internal codes and ends every endless loading flame.
 */

import { byId } from './dom.js';
import { renderCoins } from './coinView.js';
import { renderLedger } from './ledgerView.js';
import { setTransferAvailability, showUnavailableWalletPolicy } from './WalletIdentitySurface.js';

const LOGGED_OUT_MESSAGE = 'Sign in to view your Wallet balance.';
const WALLET_ERROR_MESSAGES = Object.freeze({
	login_required: LOGGED_OUT_MESSAGE,
	wallet_network_error: 'Wallet service could not be reached. Try again.'
});

/** Presents confirmed account balances and enables authenticated transfers. */
export function renderWallet(response) {
	if (!response?.ok || !response.wallet) {
		renderLoggedOut(response);
		return;
	}

	const wallet = response.wallet;
	setTransferAvailability(true);
	byId('balance').textContent = wallet.display?.total
		|| `${wallet.balance.toLocaleString()} Perutas`;
	byId('usdValue').textContent = [
		`${wallet.balance.toLocaleString()} exact Perutas`,
		`purchase reference ≈ $${wallet.usdValue.toFixed(4)}`,
		'no cash-out'
	].join(' · ');
	setBucketDisplay('promotionalBalance', wallet.display?.promotional, wallet.promotionalBalance);
	setBucketDisplay('purchasedBalance', wallet.display?.purchased, wallet.purchasedBalance);
	renderCoins(byId('coinGrid'), wallet.coins || []);
	renderLedger(byId('ledger'), wallet.recent || []);
	renderRefill(wallet);
}

/** Shows the server's exact balance without implying it is cash. */
function setBucketDisplay(id, display, exact) {
	const element = byId(id);
	element.textContent = display || `${exact.toLocaleString()} Perutas`;
	element.title = `${exact.toLocaleString()} exact Perutas`;
}

/** Renders the promotional cap and refill policy after a successful request. */
function renderRefill(wallet) {
	const promotional = Number(wallet.promotionalBalance) || 0;
	const cap = Number(wallet.cap) || 0;
	const dailyRefill = Number(wallet.dailyRefill) || 0;
	const percentage = cap > 0
		? Math.min(100, Math.round((promotional / cap) * 100))
		: 0;
	byId('meterFill').style.width = `${percentage}%`;
	byId('meterValue').textContent = `${promotional.toLocaleString()} / ${cap.toLocaleString()}`;
	byId('refillText').textContent = [
		`Daily refill: +${dailyRefill.toLocaleString()} promotional Perutas.`,
		'Purchased Perutas stay outside the promotional cap.'
	].join(' ');
}

/** Converts missing identity or service failures into finite, readable states. */
function renderLoggedOut(response) {
	byId('balance').textContent = response?.error === 'login_required'
		? 'Login needed'
		: 'Balance unavailable';
	byId('usdValue').textContent = humanWalletError(response?.error);
	byId('promotionalBalance').textContent = '—';
	byId('purchasedBalance').textContent = '—';
	const coinGrid = byId('coinGrid');
	if (coinGrid) {
		coinGrid.textContent = response?.error === 'login_required'
			? 'Sign in to see your exact balance decomposition.'
			: 'Account balances could not be loaded. Refresh to retry.';
	}
	showUnavailableWalletPolicy(response?.error);
}

/** Maps internal codes to human-facing copy without leaking raw tokens. */
function humanWalletError(code) {
	return WALLET_ERROR_MESSAGES[code] || 'Wallet balance is unavailable right now.';
}

/** Updates the checkout status without touching any transaction. */
export function setCheckoutStatus(message, tone = 'normal') {
	const status = byId('checkoutStatus');
	status.textContent = message;
	status.dataset.tone = tone;
}
