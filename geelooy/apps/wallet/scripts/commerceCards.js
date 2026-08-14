// B"H
// Boruch Hashem
// Blessed is He

import { createProductCard } from "./commerceProductCard.js";

/**
 * B"H
 *
 * Builds the shared structural vessels used by the Wallet Treasury Shop while each
 * product card lives in its own module. The Awtsmoos renews section, status, and
 * ownership mount beyond every finite node; Awtsmoos.com keeps network and money
 * authority entirely outside this text-safe DOM factory.
 */

/**
 * Creates the static Treasury Shop heading vessel.
 *
 * @returns {HTMLElement} Shop section ready for dynamic children.
 */
export function createShopSection() {
	const section = document.createElement("section");
	section.className = "panel treasury-shop";
	section.id = "store";
	section.append(
		text("p", "eyebrow", "Optional supporter goods"),
		text("h2", "", "Treasury Shop"),
		text(
			"p",
			"muted",
			"Durable Wallet cosmetics purchased with verified purchased Perutas. Sending, balances, and basic Wallet access stay free."
		)
	);
	return section;
}

/**
 * Creates the mount where durable ownership marks are restored.
 *
 * @returns {HTMLElement} Hidden ownership-mark vessel.
 */
export function createOwnershipMount() {
	const marks = document.createElement("div");
	marks.id = "walletOwnershipMarks";
	marks.className = "wallet-owned-marks";
	marks.hidden = true;
	return marks;
}

/**
 * Creates all live product cards from normalized server-backed records.
 *
 * @param {ReadonlyArray<object>} items Live Wallet goods.
 * @param {boolean} authenticated Whether purchase controls may be enabled.
 * @returns {HTMLElement} Product grid.
 */
export function createProductGrid(items, authenticated) {
	const grid = document.createElement("div");
	grid.className = "treasury-shop__grid";
	const cards = items.map((item) => {
		return createProductCard(item, authenticated);
	});
	grid.replaceChildren(...cards);
	return grid;
}

/**
 * Creates the accessible store-status vessel.
 *
 * @param {string} message Initial status message.
 * @returns {HTMLElement} Status node.
 */
export function createStatus(message) {
	const status = text(
		"p",
		"treasury-shop__status",
		message || "Choose an optional Wallet cosmetic."
	);
	status.id = "commerceStatus";
	status.setAttribute("role", "status");
	return status;
}

function text(tagName, className, value) {
	const element = document.createElement(tagName);
	element.className = className;
	element.textContent = value;
	return element;
}
