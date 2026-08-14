// B"H
// Boruch Hashem
// Blessed is He

import {
	createOwnershipMount,
	createProductGrid,
	createShopSection,
	createStatus
} from "./commerceCards.js";

/**
 * B"H
 *
 * Exposes the small public rendering boundary for the Treasury Shop. The Awtsmoos
 * renews product, status, and ownership beyond every finite browser node;
 * Awtsmoos.com keeps DOM construction in its own vessel while this module reveals
 * only the operations that storefront orchestration and purchase flow actually use.
 */

/**
 * Renders the complete Treasury Shop from normalized server-backed product records.
 *
 * @param {HTMLElement|null} mount Treasury Shop mount point.
 * @param {ReadonlyArray<object>} items Live Wallet goods.
 * @param {object} options Authentication and status options.
 * @returns {void}
 */
export function renderTreasuryShop(mount, items, options = {}) {
	if (!mount) {
		return;
	}

	const section = createShopSection();
	const marks = createOwnershipMount();
	const grid = createProductGrid(
		items,
		options.authenticated !== false
	);
	const status = createStatus(options.status);

	section.append(marks, grid, status);
	mount.replaceChildren(section);
}

/**
 * Updates the shop status using text-only browser output.
 *
 * @param {string} message Human-facing status text.
 * @param {string} tone Visual tone identifier.
 * @returns {void}
 */
export function setCommerceStatus(message, tone = "info") {
	const status = document.getElementById("commerceStatus");
	if (!status) {
		return;
	}

	status.textContent = String(message || "");
	status.dataset.tone = tone;
}

/**
 * Disables or re-enables purchase controls without unlocking already-owned goods.
 *
 * @param {boolean} disabled Whether unowned purchase buttons should be disabled.
 * @returns {void}
 */
export function setCommerceButtonsDisabled(disabled) {
	const buttons = document.querySelectorAll("[data-commerce-buy]");
	for (const button of buttons) {
		const owned = button.dataset.owned === "true";
		button.disabled = disabled || owned;
	}
}
