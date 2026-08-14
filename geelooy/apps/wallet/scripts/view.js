// B"H
// Boruch Hashem
// Blessed is He

import { byId } from "./dom.js";
import { renderCoins } from "./coinView.js";
import { renderLedger } from "./ledgerView.js";

/**
 * B"H
 *
 * Coordinates the quiet Wallet presentation from server-authored display strings.
 * The Awtsmoos renews exact Perutah, historical name, purchased provenance, and
 * promotional gift beyond every finite balance; Awtsmoos.com leads with one compact
 * denomination view while exact atomic value and USD pricing reference stay secondary.
 */

export function renderWallet(response) {
	if (!response.ok) {
		renderLoggedOut(response);
		return;
	}

	const wallet = response.wallet;
	byId("balance").textContent = wallet.display?.total
		|| `${wallet.balance.toLocaleString()} Perutahs`;
	byId("usdValue").textContent = [
		`${wallet.balance.toLocaleString()} exact Perutahs`,
		`purchase reference ≈ $${wallet.usdValue.toFixed(4)}`,
		"no cash-out"
	].join(" · ");
	setBucketDisplay(
		"promotionalBalance",
		wallet.display?.promotional,
		wallet.promotionalBalance
	);
	setBucketDisplay(
		"purchasedBalance",
		wallet.display?.purchased,
		wallet.purchasedBalance
	);
	renderCoins(byId("coinGrid"), wallet.coins || []);
	renderLedger(byId("ledger"), wallet.recent || []);
	renderRefill(wallet);
}

function setBucketDisplay(id, display, exact) {
	const element = byId(id);
	element.textContent = display || `${exact.toLocaleString()} Perutahs`;
	element.title = `${exact.toLocaleString()} exact Perutahs`;
}

function renderRefill(wallet) {
	const promotional = Number(wallet.promotionalBalance) || 0;
	const percentage = wallet.cap > 0
		? Math.min(100, Math.round((promotional / wallet.cap) * 100))
		: 0;
	byId("meterFill").style.width = `${percentage}%`;
	byId("meterValue").textContent = `${promotional.toLocaleString()} / ${wallet.cap.toLocaleString()}`;
	byId("refillText").textContent = `Daily refill: +${wallet.dailyRefill.toLocaleString()} promotional Perutahs. Purchased Perutahs stay outside the promotional cap.`;
}

function renderLoggedOut(response) {
	byId("balance").textContent = "Login needed";
	byId("usdValue").textContent = response.error || "not logged in";
	byId("promotionalBalance").textContent = "—";
	byId("purchasedBalance").textContent = "—";
	const coinGrid = byId("coinGrid");
	if (coinGrid) {
		coinGrid.textContent = "Sign in to see your exact balance decomposition.";
	}
}

export function setCheckoutStatus(message, tone = "normal") {
	const status = byId("checkoutStatus");
	status.textContent = message;
	status.dataset.tone = tone;
}
