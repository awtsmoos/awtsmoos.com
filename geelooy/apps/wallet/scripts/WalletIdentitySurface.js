// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module WalletIdentitySurface
 * @description
 * The Awtsmoos lets value be shared only with an authenticated name;
 * Awtsmoos.com keeps an empty gate honest, never leaving a loading flame.
 */

/**
 * Makes gift controls unavailable until the Wallet service confirms identity.
 * @param {boolean} authorized - Whether a valid wallet was received.
 * @param {Document} page - The current Wallet document.
 * @returns {void}
 */
export function setTransferAvailability(authorized, page = document) {
	const form = page.getElementById('transferForm');
	if (!form) return;

	for (const control of form.querySelectorAll('input, textarea, button')) {
		control.disabled = !authorized;
	}
	form.setAttribute('aria-disabled', String(!authorized));
}

/**
 * Replaces indefinite refill spinners with an accurate visitor state.
 * @param {string} errorCode - Public API error category, never displayed raw.
 * @param {Document} page - Wallet document.
 * @returns {void}
 */
export function showUnavailableWalletPolicy(errorCode, page = document) {
	const needsLogin = errorCode === 'login_required';
	const cap = page.getElementById('meterValue');
	const refill = page.getElementById('refillText');
	const bar = page.getElementById('meterFill');
	const ledger = page.getElementById('ledger');

	if (cap) cap.textContent = needsLogin ? 'Sign in to view' : 'Unavailable';
	if (refill) {
		refill.textContent = needsLogin
			? 'Sign in to see your daily promotional refill policy.'
			: 'The refill policy is temporarily unavailable. Refresh to retry.';
	}
	if (bar) bar.style.width = '0%';
	if (ledger) {
		ledger.textContent = needsLogin
			? 'Sign in to review your transaction history.'
			: 'Ledger could not be loaded. Refresh to try again.';
	}
	setTransferAvailability(false, page);
}
