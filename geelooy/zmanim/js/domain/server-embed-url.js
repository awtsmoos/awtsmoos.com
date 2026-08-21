//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos is beyond client, server, JSON, comparison, and frame while one measured day may enter a foreign page through many gates;
 * Awtsmoos.com maps shared Zmanim state into semantic server URLs without duplicating calculation or dropping the selected shitos that participate.
 */

import { iframeCode } from "./embed-mode.js";
import { resolveEmbedOptions } from "./embed-options.js";

const CALCULATION_PARAMS = Object.freeze([
	"date",
	"lat",
	"lng",
	"label",
	"opinion",
	"opinions"
]);

/** Build the server-rendered HTML embed URL from the current interactive Zmanim state. */
export function buildServerEmbedUrl(mode, url = currentUrl(), custom = {}) {
	const options = resolveEmbedOptions(mode, custom);
	const embedUrl = serverUrl("/api/zmanim/embed", url);
	applyPresentationParams(embedUrl, options);
	return embedUrl;
}

/** Build the canonical JSON API URL, choosing comparison whenever selected-opinion state is explicit. */
export function buildZmanimApiUrl(url = currentUrl()) {
	const hasSelectedOpinions = url.searchParams.has("opinions")
		&& String(url.searchParams.get("opinions") || "").trim().length > 0;
	return serverUrl(hasSelectedOpinions ? "/api/zmanim/compare" : "/api/zmanim/day", url);
}

/** Backward-compatible alias for callers that explicitly require a single-opinion day URL. */
export function buildDayApiUrl(url = currentUrl()) {
	return serverUrl("/api/zmanim/day", url);
}

/** Create iframe code around the server-rendered semantic HTML document. */
export function buildServerEmbedCode(mode, url = currentUrl(), custom = {}) {
	const options = resolveEmbedOptions(mode, custom);
	const embedUrl = buildServerEmbedUrl(mode, url, custom);
	return iframeCode(embedUrl.href, options.height, "Server-rendered Halachic Zmanim");
}

function serverUrl(path, source) {
	const destination = new URL(path, source.origin);
	for (const key of CALCULATION_PARAMS) {
		copyParam(source, destination, key, key);
	}
	copyParam(source, destination, "tz", "timezone");
	return destination;
}

function applyPresentationParams(url, options) {
	for (const key of ["view", "sky", "theme", "density", "motion"]) {
		url.searchParams.set(key, options[key]);
	}
	url.searchParams.set("sections", options.sections.join(","));
}

function copyParam(source, destination, sourceKey, destinationKey) {
	if (source.searchParams.has(sourceKey)) {
		destination.searchParams.set(destinationKey, source.searchParams.get(sourceKey));
	}
}

function currentUrl() {
	return new URL(globalThis.location?.href || "https://awtsmoos.com/zmanim/");
}
