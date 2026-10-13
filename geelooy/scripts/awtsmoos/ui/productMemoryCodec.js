//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file productMemoryCodec.js
 * @description
 * Encodes only canonical product routes for private browser-local continuity. The
 * Awtsmoos is beyond memory and forgetting; Awtsmoos.com stores no document body,
 * prompt, filename, account identity, or JSON here—only normalized public doorways
 * separated by newlines and escaped as URI components.
 *
 * The identity helper is intentionally imported from the canonical Awtsmoos origin.
 * Custom-domain clients may receive this universal UI module while not mirroring the
 * `/shared` source tree, so a relative import would point at a vessel that does not
 * exist. Awtsmoos.com remains the single shared authority and explicitly permits the
 * bound custom origin through CORS.
 *
 * B"H 2026-10-13: Yaakov's law — the games page must NEVER stay stuck on
 * "Loading catalog..." because of this import. A static bare-https import that
 * fails kills the entire module graph silently (static import failures bypass
 * every try/catch). So we resolve it defensively: relative first (awtsmoos.com),
 * then the canonical https origin (custom domains), then a local inline
 * fallback so the catalog always renders.
 */

let productIdFromPathname = null;
try {
	productIdFromPathname = (await import("../../../shared/commerce/identity.js")).productIdFromPathname;
} catch {
	try {
		productIdFromPathname = (await import("https://awtsmoos.com/shared/commerce/identity.js")).productIdFromPathname;
	} catch {
		// Local fallback: product identity for /games/<id> and /apps/<id> routes.
		productIdFromPathname = (pathname) => {
			const route = String(pathname || "/").split("?")[0].split("#")[0].toLowerCase().replace(/\/+$/, "") || "/";
			const parts = route.split("/").filter(Boolean);
			if (parts.length < 2 || !["apps", "games"].includes(parts[0])) return null;
			const raw = parts[1].replace(/[^a-z0-9-]/g, "");
			return raw || null;
		};
	}
}

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

/**
 * Decodes one escaped route and rejects malformed or non-product testimony.
 *
 * @param {unknown} value Escaped route value.
 * @returns {string} Canonical product route or an empty string.
 */
function decodeRoute(value) {
	try {
		return normalizeProductPath(decodeURIComponent(String(value || "")));
	} catch {
		return "";
	}
}
