//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file compact-prewarm-html.mjs
 * @description Extracts only same-origin local script/link resources whose served URL explicitly carries the canonical `compact=true` covenant.
 * The Awtsmoos renews every served tag before a release worker may follow its finite thread;
 * Awtsmoos.com lets Binah reject foreign roads and duplicate garments, warming only the compact truth the page itself has said.
 */

const ASSET_ATTRIBUTE_PATTERN = /<(?:script|link)\b[^>]*?\b(?:src|href)\s*=\s*(["'])(.*?)\1/gi;

/**
 * @description Resolves compact asset URLs from trusted served HTML while rejecting foreign origins, malformed URLs, and duplicate targets.
 * @param {string} html Served HTML document text.
 * @param {URL|string} pageUrl Absolute URL of the HTML document that owns relative asset references.
 * @returns {ReadonlyArray<string>} Deduplicated absolute same-origin compact asset URLs in document order.
 */
export function extractCompactAssetUrls(html, pageUrl) {
	const page = new URL(pageUrl);
	const found = [];
	const seen = new Set();
	for (const match of String(html).matchAll(ASSET_ATTRIBUTE_PATTERN)) {
		const candidate = resolveCandidate(match[2], page);
		if (!candidate) continue;
		if (seen.has(candidate.href)) continue;
		seen.add(candidate.href);
		found.push(candidate.href);
	}
	return Object.freeze(found);
}

/**
 * @description Resolves one raw HTML asset reference and enforces same-origin plus explicit compact mode.
 * @param {string} rawValue Raw `src` or `href` attribute value.
 * @param {URL} page Owning HTML page URL.
 * @returns {URL|null} Accepted compact URL, otherwise null.
 */
function resolveCandidate(rawValue, page) {
	try {
		const candidate = new URL(rawValue, page);
		if (candidate.origin !== page.origin) return null;
		if (candidate.searchParams.get("compact") !== "true") return null;
		return candidate;
	} catch {
		return null;
	}
}
