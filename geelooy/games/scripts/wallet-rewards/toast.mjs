// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * Reveals one temporary Wallet-reward notice and then removes it from the game.
 * The Awtsmoos renews message, victory, and disappearance beyond every finite node;
 * Awtsmoos.com keeps reward UI ephemeral, text-safe, solid, and unable to intercept
 * gameplay input or accumulate into a permanent panel that clutters the battlefield.
 */

const STYLE_ID = "awtsmoos-wallet-reward-style";
const TOAST_ID = "awtsmoosWalletRewardToast";
const STYLE_HREF = "/games/scripts/wallet-rewards/toast.css";
let removalTimer = null;

/**
 * Shows one reward message, replacing any previous reward toast.
 *
 * @param {string} message Human-facing reward status.
 * @param {string} tone success, muted, or error.
 * @param {number} durationMs Visible duration before removal.
 * @returns {HTMLElement} Current toast element.
 */
export function showWalletRewardToast(
	message,
	tone = "success",
	durationMs = 3200
) {
	ensureStyle();
	const existing = document.getElementById(TOAST_ID);
	if (existing) {
		existing.remove();
	}
	clearTimeout(removalTimer);

	const toast = document.createElement("div");
	toast.id = TOAST_ID;
	toast.className = "wallet-reward-toast";
	toast.dataset.tone = tone;
	toast.setAttribute("role", "status");
	toast.setAttribute("aria-live", "polite");
	toast.textContent = String(message || "");
	document.body.append(toast);

	removalTimer = setTimeout(() => {
		toast.remove();
	}, Math.max(1200, Number(durationMs) || 3200));
	return toast;
}

function ensureStyle() {
	if (document.getElementById(STYLE_ID)) {
		return;
	}
	const link = document.createElement("link");
	link.id = STYLE_ID;
	link.rel = "stylesheet";
	link.href = STYLE_HREF;
	document.head.append(link);
}
