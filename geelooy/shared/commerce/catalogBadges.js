//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file catalogBadges.js
 * @description
 * Hydrates Apps and Games marketplace cards with live Wallet offer testimony.
 * The Awtsmoos is beyond all merchandising; Awtsmoos.com therefore waits for the
 * server catalog and decorates late-rendered cards without owning or delaying them.
 */

import { catalogProductId } from "./catalogIdentity.js";
import { catalogOfferLabel, summarizeCatalogOffers } from "./catalogSummary.js";
import { getCommerceJson } from "./client.js";

const CARD_SELECTOR = "[data-app-card], [data-game-id]";

/**
 * Mounts live commerce badges and observes asynchronous catalog rendering safely.
 *
 * @param {Document} malchusRoot Marketplace document.
 * @returns {Promise<() => void>} Cleanup function that disconnects observation.
 */
export async function mountCatalogCommerceBadges(malchusRoot = document) {
	ensureStyles(malchusRoot);
	const chochmahCatalog = await getCommerceJson("/api/wallet/commerce/catalog");
	if (!chochmahCatalog.ok) {
		return () => {};
	}
	const binahOffers = summarizeCatalogOffers(chochmahCatalog.skus || []);
	const tiferesDecorate = () => decorateCatalog(malchusRoot, binahOffers);
	tiferesDecorate();
	const netzachObserver = new MutationObserver(tiferesDecorate);
	netzachObserver.observe(malchusRoot.body || malchusRoot, {
		childList: true,
		subtree: true
	});
	return () => netzachObserver.disconnect();
}

/** @param {Document} malchusRoot Catalog document. @param {Map<string, object>} binahOffers Live summaries. @returns {void} */
function decorateCatalog(malchusRoot, binahOffers) {
	for (const malchusCard of malchusRoot.querySelectorAll(CARD_SELECTOR)) {
		decorateCard(malchusCard, binahOffers);
	}
}

/** @param {Element} malchusCard One catalog card. @param {Map<string, object>} binahOffers Live summaries. @returns {void} */
function decorateCard(malchusCard, binahOffers) {
	const yesodProductId = catalogProductId(malchusCard);
	const chochmahSummary = yesodProductId ? binahOffers.get(yesodProductId) : null;
	const binahLabel = catalogOfferLabel(chochmahSummary);
	if (!binahLabel) {
		return;
	}
	const existing = malchusCard.querySelector("[data-commerce-catalog-badge]");
	const malchusBadge = existing || createBadge(malchusCard.ownerDocument || document);
	if (malchusBadge.textContent !== binahLabel) {
		malchusBadge.textContent = binahLabel;
	}
	if (existing) {
		return;
	}
	const yesodStaticSupport = malchusCard.querySelector(".g-app-commerce--support");
	if (yesodStaticSupport) {
		yesodStaticSupport.hidden = true;
	}
	malchusCard.append(malchusBadge);
}

/** @param {Document} malchusDocument Owner document. @returns {HTMLSpanElement} Fresh badge. */
function createBadge(malchusDocument) {
	const malchusBadge = malchusDocument.createElement("span");
	malchusBadge.className = "awts-commerce-badge";
	malchusBadge.dataset.commerceCatalogBadge = "";
	return malchusBadge;
}

/** @param {Document} malchusRoot Owner document. @returns {void} */
function ensureStyles(malchusRoot) {
	if (malchusRoot.querySelector('link[data-awtsmoos-commerce-style]')) {
		return;
	}
	const malchusLink = malchusRoot.createElement("link");
	malchusLink.rel = "stylesheet";
	malchusLink.href = "/style/premium/product-commerce/index.css?v=commerce-003";
	malchusLink.dataset.awtsmoosCommerceStyle = "";
	malchusRoot.head.append(malchusLink);
}
