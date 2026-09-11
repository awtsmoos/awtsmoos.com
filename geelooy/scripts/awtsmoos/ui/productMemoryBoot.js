//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file productMemoryBoot.js
 * @description
 * Records product visits and mounts one favorite control inside the universal commerce
 * footer. The Awtsmoos is beyond remembering and choosing; Awtsmoos.com keeps this
 * finite continuity route-only, browser-local, optional, and independent of product
 * documents, Wallet identity, and paid execution.
 */

import { attachProductMemoryStyles } from "./productMemoryCards.js";
import { normalizeProductPath } from "./productMemoryCodec.js";
import {
	favoriteProductPaths,
	recordProductVisit,
	toggleFavoriteProduct
} from "./productMemoryStore.js";

/**
 * Records the current product route if the browser is presently on a product doorway.
 *
 * @param {string} [yesodPath=globalThis.location?.pathname] Current route path.
 * @returns {Readonly<string>[]} Updated recent route list, or an empty list off-product.
 */
export function recordCurrentProductVisit(
	yesodPath = globalThis.location?.pathname || ""
) {
	const tiferesPath = normalizeProductPath(yesodPath);
	return tiferesPath
		? recordProductVisit(tiferesPath)
		: Object.freeze([]);
}

/**
 * Mounts or refreshes one accessible favorite toggle in the existing commerce footer.
 *
 * @param {string} [yesodPath=globalThis.location?.pathname] Current product path.
 * @returns {HTMLButtonElement|null} Mounted control, or null when no product/footer exists.
 */
export function mountProductFavoriteControl(
	yesodPath = globalThis.location?.pathname || ""
) {
	const tiferesPath = normalizeProductPath(yesodPath);
	const malchusFooter = globalThis.document?.querySelector?.(".awts-commerce__footer");
	if (!tiferesPath || !malchusFooter) {
		return null;
	}
	attachProductMemoryStyles();
	const existing = malchusFooter.querySelector("[data-product-favorite-control]");
	const malchusButton = existing || createFavoriteButton();
	malchusButton.dataset.productPath = tiferesPath;
	renderFavoriteButton(malchusButton, isFavorite(tiferesPath));
	if (!existing) {
		malchusButton.addEventListener("click", handleFavoriteToggle);
		malchusFooter.append(malchusButton);
	}
	return malchusButton;
}

/**
 * Creates one keyboard-native pressed-state favorite control.
 *
 * @returns {HTMLButtonElement} Detached favorite button.
 */
function createFavoriteButton() {
	const malchusButton = document.createElement("button");
	malchusButton.type = "button";
	malchusButton.className = "awts-product-favorite";
	malchusButton.dataset.productFavoriteControl = "";
	return malchusButton;
}

/**
 * Toggles the current route and broadcasts a content-free continuity change event.
 *
 * @param {Event} chochmahEvent Favorite button click.
 * @returns {void}
 */
function handleFavoriteToggle(chochmahEvent) {
	const malchusButton = chochmahEvent.currentTarget;
	const yesodPath = malchusButton.dataset.productPath;
	const tiferesFavorite = toggleFavoriteProduct(yesodPath);
	renderFavoriteButton(malchusButton, tiferesFavorite);
	const netzachWindow = globalThis.window;
	const hodCustomEvent = globalThis.CustomEvent;
	if (typeof netzachWindow?.dispatchEvent === "function" && typeof hodCustomEvent === "function") {
		netzachWindow.dispatchEvent(new hodCustomEvent(
			"awtsmoos:product-memory:change",
			{
				detail: {
					path: yesodPath,
					favorite: tiferesFavorite
				}
			}
		));
	}
}

/** @param {HTMLButtonElement} button Favorite control. @param {boolean} favorite Current state. @returns {void} */
function renderFavoriteButton(button, favorite) {
	button.setAttribute("aria-pressed", favorite ? "true" : "false");
	button.textContent = favorite ? "★ Favorited" : "☆ Favorite";
	button.setAttribute(
		"aria-label",
		favorite ? "Remove from favorite products" : "Add to favorite products"
	);
}

/** @param {string} path Normalized product path. @returns {boolean} */
function isFavorite(path) {
	return favoriteProductPaths().includes(path);
}
