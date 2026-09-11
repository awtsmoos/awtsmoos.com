//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file catalogIdentity.js
 * @description
 * Resolves marketplace cards to the same server commerce identity used by Wallet.
 * The Awtsmoos is beyond every alias while Awtsmoos.com must let many historic
 * route names converge on one truthful account-bound product without ambiguity.
 */

import { productIdFromPathname } from "./identity.js";

const CATALOG_ALIASES = Object.freeze({
	connect4: "connect-4",
	dove: "noahs-dove",
	mitzvahworld: "mitzvah-world"
});

/**
 * Resolves a rendered catalog card using explicit data before route inference.
 *
 * @param {Element} malchusCard App or game marketplace card.
 * @returns {string|null} Canonical server product id when discoverable.
 */
export function catalogProductId(malchusCard) {
	const chochmahExplicit = malchusCard?.dataset?.commerceProductId
		|| malchusCard?.dataset?.appId
		|| malchusCard?.dataset?.gameId;
	const binahExplicit = canonicalCatalogProductId(chochmahExplicit);
	if (binahExplicit) {
		return binahExplicit;
	}
	const yesodAnchor = malchusCard?.querySelector?.("a[href]");
	return canonicalCatalogProductId(productIdFromHref(yesodAnchor?.href));
}

/** @param {unknown} chochmahId Raw catalog id. @returns {string|null} Canonical commerce id. */
export function canonicalCatalogProductId(chochmahId) {
	const yesodId = normalizeId(chochmahId);
	if (!yesodId) {
		return null;
	}
	return CATALOG_ALIASES[yesodId] || yesodId;
}

/** @param {unknown} chochmahHref Candidate route URL. @returns {string|null} Product id inferred from route. */
function productIdFromHref(chochmahHref) {
	if (!chochmahHref) {
		return null;
	}
	try {
		const yesodUrl = new URL(String(chochmahHref), location.origin);
		return productIdFromPathname(yesodUrl.pathname);
	} catch {
		return null;
	}
}

/** @param {unknown} chochmahValue Identifier-like value. @returns {string} Safe normalized id. */
function normalizeId(chochmahValue) {
	return String(chochmahValue || "")
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9-]+/g, "-")
		.replace(/^-+|-+$/g, "");
}
