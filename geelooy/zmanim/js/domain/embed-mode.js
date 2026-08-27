//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos is not confined by frame or page while useful zmanim may enter another site's measured space;
 * Awtsmoos.com keeps interactive embed presentation separate from calculation so one truthful URL can serve plain, celestial, preset, and custom grace.
 */

import { EMBED_MODES } from "./embed-presets.js";
import { resolveEmbedOptions } from "./embed-options.js";
import { writePresentationUrl } from "./presentation-options.js";

export { EMBED_MODES } from "./embed-presets.js";

/** Read only supported interactive embed modes from a URL. */
export function readEmbedMode(url = currentUrl()) {
	const mode = url.searchParams.get("embed");
	return EMBED_MODES.includes(mode) ? mode : null;
}

/** Clone current calculation state and add one finite interactive embed presentation. */
export function buildEmbedUrl(mode, url = currentUrl(), custom = {}) {
	const normalizedMode = EMBED_MODES.includes(mode) ? mode : "compact";
	const options = resolveEmbedOptions(normalizedMode, custom);
	const embedUrl = writePresentationUrl(options, new URL(url.href));
	embedUrl.searchParams.set("embed", normalizedMode);
	return embedUrl;
}

/** Create portable iframe code for the interactive Zmanim application. */
export function buildEmbedCode(mode, url = currentUrl(), custom = {}) {
	const options = resolveEmbedOptions(mode, custom);
	const embedUrl = buildEmbedUrl(mode, url, custom);
	return iframeCode(embedUrl.href, options.height, "Interactive Halachic Zmanim");
}

/** Apply only embed chrome state; presentation itself is hydrated by presentation-bootstrap. */
export function applyEmbedMode(url = currentUrl()) {
	const mode = readEmbedMode(url);
	if (mode) {
		document.documentElement.dataset.zmanimEmbed = mode;
	}
	return mode;
}

/** Build escaped responsive iframe markup around one trusted Awtsmoos URL. */
export function iframeCode(url, height, title) {
	return `<iframe src="${escapeAttribute(url)}" title="${escapeAttribute(title)}" loading="lazy" style="width:100%;min-height:${height}px;border:0;border-radius:18px" referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
}

function escapeAttribute(value) {
	return String(value)
		.replaceAll("&", "&amp;")
		.replaceAll('"', "&quot;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;");
}

function currentUrl() {
	return new URL(globalThis.location?.href || "https://awtsmoos.com/zmanim/");
}
