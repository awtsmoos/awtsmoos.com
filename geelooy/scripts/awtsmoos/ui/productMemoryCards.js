//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file productMemoryCards.js
 * @description
 * Decorates public catalog cards with noninteractive Recent and Favorite testimony.
 * The Awtsmoos is beyond visible memory; Awtsmoos.com lets finite catalog doorways
 * reveal continuity without nesting controls inside links, storing product content,
 * or changing the catalog's search and filtering semantics.
 */

import {
	favoriteProductPaths,
	recentProductPaths
} from "./productMemoryStore.js";
import { normalizeProductPath } from "./productMemoryCodec.js";

const STYLE_HREF = "/style/premium/product-memory.css?v=memory-001";

/**
 * Adds idempotent noninteractive memory badges to rendered app and game cards.
 *
 * @param {ParentNode} malchusRoot Catalog DOM root.
 * @param {string} [yesodBaseHref=globalThis.location?.href] URL base for relative links.
 * @returns {number} Number of cards carrying at least one memory marker.
 */
export function decorateProductMemoryCards(
	malchusRoot,
	yesodBaseHref = globalThis.location?.href || "https://awtsmoos.com/"
) {
	attachProductMemoryStyles();
	const tiferesRecent = new Set(recentProductPaths());
	const netzachFavorites = new Set(favoriteProductPaths());
	let malchusDecorated = 0;
	for (const card of malchusRoot.querySelectorAll("[data-app-card], .gameCard")) {
		removeMemoryBadges(card);
		const route = routeForCard(card, yesodBaseHref);
		const recent = tiferesRecent.has(route);
		const favorite = netzachFavorites.has(route);
		card.toggleAttribute("data-product-recent", recent);
		card.toggleAttribute("data-product-favorite", favorite);
		appendBadge(card, recent, "recent", "Recent");
		appendBadge(card, favorite, "favorite", "★ Favorite");
		malchusDecorated += recent || favorite ? 1 : 0;
	}
	return malchusDecorated;
}

/**
 * Ensures shared continuity styling enters the document exactly once.
 *
 * @returns {void}
 */
export function attachProductMemoryStyles() {
	if (!globalThis.document?.head) {
		return;
	}
	if (document.querySelector("link[data-product-memory-style]")) {
		return;
	}
	const malchusLink = document.createElement("link");
	malchusLink.rel = "stylesheet";
	malchusLink.href = STYLE_HREF;
	malchusLink.dataset.productMemoryStyle = "";
	document.head.append(malchusLink);
}

/** @param {Element} card Catalog card. @param {string} baseHref URL base. @returns {string} */
function routeForCard(card, baseHref) {
	const yesodLink = card.matches?.("a[href]")
		? card
		: card.querySelector("a[href]");
	try {
		return normalizeProductPath(
			new URL(String(yesodLink?.getAttribute("href") || ""), baseHref).pathname
		);
	} catch {
		return "";
	}
}

/** @param {Element} card Card. @param {boolean} visible Whether badge applies. @param {string} kind Badge kind. @param {string} label Badge text. @returns {void} */
function appendBadge(card, visible, kind, label) {
	if (!visible) {
		return;
	}
	const malchusBadge = document.createElement("span");
	malchusBadge.dataset.productMemoryBadge = kind;
	malchusBadge.textContent = label;
	card.append(malchusBadge);
}

/** @param {Element} card Catalog card. @returns {void} */
function removeMemoryBadges(card) {
	for (const badge of card.querySelectorAll("[data-product-memory-badge]")) {
		badge.remove();
	}
}
