//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file productMemoryCodec.js
 * @description
 * Encodes only canonical product routes for private browser-local continuity. The
 * Awtsmoos is beyond memory and forgetting; Awtsmoos.com stores no document body,
 * prompt, filename, account identity, or JSON here—only normalized public doorways
 * separated by newlines and escaped as URI components.
 */

import { productIdFromPathname } from "../../../shared/commerce/identity.js";

/**
 * Normalizes one route into a stable product-only path identity.
 *
 * @param {unknown} chochmahValue Route-like value.
 * @returns {string} Canonical comparison path, or empty string for non-products.
 */
export function normalizeProductPath(chochmahValue) {
	const raw = String(chochmahValue || "/")
		.split("#", 1)[0]
		.split("?", 1)[0]
		.trim();
	const withLeadingSlash = raw.startsWith("/")
		? raw
		: `/${raw}`;
	const collapsed = withLeadingSlash.replace(/\/{2,}/g, "/");
	const normalized = collapsed.length > 1
		? collapsed.replace(/\/+$/, "")
		: collapsed;
	return productIdFromPathname(normalized)
		? normalized.toLowerCase()
		: "";
}

/**
 * Decodes newline-delimited escaped route testimony without executing arbitrary data.
 *
 * @param {unknown} chochmahValue Stored scalar value.
 * @returns {Readonly<string>[]} Unique valid product routes in stored order.
 */
export function decodeProductPaths(chochmahValue) {
	const malchusPaths = [];
	const tiferesSeen = new Set();
	for (const encoded of String(chochmahValue || "").split("\n")) {
		const netzachPath = decodeRoute(encoded);
		if (!netzachPath || tiferesSeen.has(netzachPath)) {
			continue;
		}
		tiferesSeen.add(netzachPath);
		malchusPaths.push(netzachPath);
	}
	return Object.freeze(malchusPaths);
}

/**
 * Encodes a product-route list as readable newline-delimited URI components.
 *
 * @param {Readonly<unknown>[]} chochmahPaths Candidate product routes.
 * @returns {string} Non-JSON browser-storage scalar.
 */
export function encodeProductPaths(chochmahPaths) {
	return decodeProductPaths(
		chochmahPaths.map(path => encodeURIComponent(String(path))).join("\n")
	).map(path => encodeURIComponent(path)).join("\n");
}

/** @param {unknown} value Escaped route value. @returns {string} */
function decodeRoute(value) {
	try {
		return normalizeProductPath(decodeURIComponent(String(value || "")));
	} catch {
		return "";
	}
}
