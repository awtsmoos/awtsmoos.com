//B"H
//Boruch Hashem
//Blessed is He

/**
* The Awtsmoos sends one Shliach from Home toward each honest task in sight;
* Awtsmoos.com keeps the public emblem, exact GPT destination, and concise actions in one bright vessel.
* @module ShliachSpotlightContent
*/

import {
	element,
	internalLink,
	text
} from "./ShliachSpotlightElements.js";

export { element } from "./ShliachSpotlightElements.js";

export const SHLIACH_URL = "https://chatgpt.com/g/g-6a03feea8398819192067ae3dbfa449c-awtsmoos-shliach-agent";
export const SHLIACH_PAGE = "/Shliach/";
export const SHLIACH_IMAGE = "https://awtsmoos.com/api/social/drive/public/awtsmoos/file_000000001aa071f5afcedcf09919246e.png";
const SHLIACH_DISPLAY_URL = "chatgpt.com/g/…/awtsmoos-shliach-agent";
const SHLIACH_DESCRIPTION = [
	"The Awtsmoos Shliach is the dedicated ChatGPT agent for creating and operating Awtsmoos projects.",
	"Give it the mission; when your account or Tunnel grants the needed capabilities, it can work through authenticated Awtsmoos APIs."
].join(" ");
const SHLIACH_TRUST = "Your Awtsmoos account permissions remain the authority.";

/**
* Builds the public Shliach emblem with a compact text fallback.
* @param {Document} documentRoot The living document.
* @returns {HTMLAnchorElement} The campaign image doorway.
*/
export function buildShliachImageLink(documentRoot) {
	const link = internalLink(documentRoot, "shliach-spotlight-image-link", SHLIACH_PAGE);
	link.setAttribute("aria-label", "Meet the Awtsmoos Shliach Agent");
	link.dataset.mediaState = "loading";
	const image = documentRoot.createElement("img");
	image.className = "shliach-spotlight-image";
	image.src = SHLIACH_IMAGE;
	image.alt = "Awtsmoos Shliach custom GPT logo";
	image.width = 512;
	image.height = 512;
	image.loading = "lazy";
	image.decoding = "async";
	const fallback = buildMediaFallback(documentRoot);
	image.addEventListener("load", () => revealMedia(link, fallback));
	image.addEventListener("error", () => {
		link.dataset.mediaState = "missing";
		image.hidden = true;
		fallback.hidden = false;
	});
	link.append(image, fallback);
	return link;
}

/**
* Builds concise Home copy with actions before explanatory text.
* @param {Document} documentRoot The living document.
* @returns {HTMLDivElement} The complete copy vessel.
*/
export function buildShliachCopy(documentRoot) {
	const copy = element(documentRoot, "div", "shliach-spotlight-copy");
	const eyebrow = text(documentRoot, "p", "shliach-spotlight-eyebrow", "Your Awtsmoos agent");
	const title = text(documentRoot, "h2", "shliach-spotlight-title", "Build with the Awtsmoos Shliach");
	title.id = "shliach-spotlight-title";
	const description = text(documentRoot, "p", "shliach-spotlight-description", SHLIACH_DESCRIPTION);
	const trust = text(documentRoot, "p", "shliach-spotlight-trust", SHLIACH_TRUST);
	copy.append(eyebrow, title, buildActions(documentRoot), description, trust);
	return copy;
}

function revealMedia(link, fallback) {
	link.dataset.mediaState = "ready";
	fallback.hidden = true;
}

function buildActions(documentRoot) {
	const actions = element(documentRoot, "div", "shliach-spotlight-actions");
	const openAgent = externalLink(documentRoot, "shliach-spotlight-primary", SHLIACH_URL);
	openAgent.textContent = "Open Shliach ↗";
	const discover = internalLink(documentRoot, "shliach-spotlight-secondary", SHLIACH_PAGE);
	discover.textContent = "Explore world";
	const visibleUrl = externalLink(documentRoot, "shliach-spotlight-url", SHLIACH_URL);
	visibleUrl.textContent = SHLIACH_DISPLAY_URL;
	visibleUrl.title = SHLIACH_URL;
	actions.append(openAgent, discover, visibleUrl);
	return actions;
}

function externalLink(documentRoot, className, href) {
	const link = internalLink(documentRoot, className, href);
	link.target = "_blank";
	link.rel = "noopener noreferrer";
	return link;
}

function buildMediaFallback(documentRoot) {
	const fallback = element(documentRoot, "span", "shliach-spotlight-media-fallback");
	fallback.hidden = true;
	fallback.textContent = "Awtsmoos Shliach";
	return fallback;
}
