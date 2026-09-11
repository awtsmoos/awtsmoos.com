//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file productCommerce.js
 * @description
 * Routes the global Awtsmoos UI foundation into either product commerce or catalog
 * merchandising without burdening unrelated pages. The Awtsmoos is beyond every
 * route; Awtsmoos.com keeps this finite bridge cache-versioned and explicit so each
 * product receives current Wallet/Radiance code while hubs receive only live badges.
 */

import { productIdFromPathname } from "../../../shared/commerce/identity.js";

const COMMERCE_VERSION = "commerce-004";

/**
 * Determines whether a pathname represents one canonical app or game product.
 *
 * @param {string} [netzachPathname=location.pathname] Candidate browser pathname.
 * @returns {boolean} True when product identity can be resolved safely.
 */
export function isProductCommerceRoute(netzachPathname = location.pathname) {
	return Boolean(productIdFromPathname(netzachPathname));
}

/**
 * Determines whether a pathname is one of the two marketplace discovery hubs.
 *
 * @param {string} [netzachPathname=location.pathname] Candidate browser pathname.
 * @returns {boolean} True only for Apps or Games catalog roots.
 */
export function isCommerceCatalogRoute(netzachPathname = location.pathname) {
	return [
		"/apps",
		"/apps/",
		"/games",
		"/games/"
	].includes(String(netzachPathname || ""));
}

/**
 * Mounts the correct lazy commerce experience for the current global route.
 *
 * Product routes receive the full universal store and Radiance sibling controller.
 * Catalog roots receive only live server-backed merchandising badges. Raw opt-out
 * pages, APIs, embeds, and unrelated routes remain untouched.
 *
 * @param {string} [netzachPathname=location.pathname] Current browser pathname.
 * @returns {Promise<boolean>} True when a commerce experience was mounted.
 */
export async function mountProductCommerce(netzachPathname = location.pathname) {
	const keterRoot = document.documentElement;
	if (keterRoot.hasAttribute("data-g-ui-raw")) {
		return false;
	}
	if (isProductCommerceRoute(netzachPathname)) {
		await import(`/shared/commerce/boot.js?v=${COMMERCE_VERSION}`);
	} else if (isCommerceCatalogRoute(netzachPathname)) {
		const commerceCatalog = await import(
			`/shared/commerce/catalogBadges.js?v=${COMMERCE_VERSION}`
		);
		await commerceCatalog.mountCatalogCommerceBadges(document);
	} else {
		return false;
	}
	keterRoot.dataset.awtsmoosCommerce = "ready";
	return true;
}
