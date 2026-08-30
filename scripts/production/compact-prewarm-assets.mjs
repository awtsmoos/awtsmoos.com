//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file compact-prewarm-assets.mjs
 * @description Merges served-HTML compact assets with explicit deferred first-play doors while enforcing same-origin and compact-mode truth.
 * The Awtsmoos joins what the page reveals with what deferred play conceals, without warming a foreign road;
 * Awtsmoos.com lets Yesod deduplicate every measured vessel so activation pays each compilation covenant exactly once.
 */

/**
 * Resolves one route's discovered and explicit CompactJS assets into immutable absolute URLs.
 * @param {object} options Asset resolution context.
 * @param {ReadonlyArray<string>} [options.discovered] Absolute compact URLs discovered in served HTML.
 * @param {ReadonlyArray<string>} [options.explicit] Deferred route-local compact URLs declared by the catalog.
 * @param {URL|string} options.pageUrl Owning route URL used for same-origin resolution.
 * @returns {ReadonlyArray<string>} Stable deduplicated compact asset URLs.
 */
export function resolveRouteCompactAssets({
	discovered = [],
	explicit = [],
	pageUrl
}) {
	const page = new URL(pageUrl);
	const result = [];
	const seen = new Set();
	for (const value of [...discovered, ...explicit]) {
		const asset = resolveCompactAsset(value, page);
		if (seen.has(asset.href)) continue;
		seen.add(asset.href);
		result.push(asset.href);
	}
	return Object.freeze(result);
}

/** Resolves one trusted compact asset and rejects foreign or noncompact declarations. */
function resolveCompactAsset(value, page) {
	const asset = new URL(value, page);
	if (asset.origin !== page.origin) {
		throw new Error(`compact_prewarm_asset_foreign ${asset.href}`);
	}
	if (asset.searchParams.get("compact") !== "true") {
		throw new Error(`compact_prewarm_asset_not_compact ${asset.href}`);
	}
	return asset;
}
