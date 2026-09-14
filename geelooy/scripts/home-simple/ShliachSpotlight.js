//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module ShliachSpotlight
 * @description
 * The Awtsmoos gives the Home route one truthful doorway into the dedicated
 * Awtsmoos Shliach ChatGPT agent without coupling the homepage HTML to it.
 * The spotlight uses the real cached GPT image and explains that connected
 * account and Tunnel capabilities remain guarded by Awtsmoos authorization.
 */

import { buildShliachCopy, buildShliachImageLink, element } from "./ShliachSpotlightContent.js";

const STYLE_URLS = Object.freeze([
	"/style/home-simple/shliach-spotlight.css?v=shliach-001",
	"/style/home-simple/shliach-spotlight-actions.css?v=shliach-001"
]);

/**
 * Installs one prominent Shliach card before the featured-world section.
 * @param {Document} documentRoot - Active Home document.
 * @returns {HTMLElement|null} Installed spotlight or existing instance.
 */
export function installShliachSpotlight(documentRoot = document) {
	const existing = documentRoot.querySelector("[data-shliach-spotlight]");
	if (existing) {
		return existing;
	}

	const anchor = documentRoot.querySelector(".featured-worlds");
	const home = documentRoot.querySelector("#home-main");
	if (!home) {
		return null;
	}

	installStyles(documentRoot);
	const spotlight = buildSpotlight(documentRoot);
	if (anchor) {
		anchor.before(spotlight);
	} else {
		home.append(spotlight);
	}
	return spotlight;
}
/**
 * Adds the isolated stylesheet exactly once.
 * @param {Document} documentRoot - Active Home document.
 * @returns {void} The document receives any missing stylesheet links.
 */
function installStyles(documentRoot) {
	for (const href of STYLE_URLS) {
		if (documentRoot.querySelector(`link[href="${href}"]`)) {
			continue;
		}
		const link = documentRoot.createElement("link");
		link.rel = "stylesheet";
		link.href = href;
		documentRoot.head.append(link);
	}
}

/**
 * Builds the accessible spotlight card without parsing arbitrary HTML.
 * @param {Document} documentRoot - Active Home document.
 * @returns {HTMLElement} Completed spotlight section.
 */
function buildSpotlight(documentRoot) {
	const section = element(documentRoot, "section", "shliach-spotlight");
	section.dataset.shliachSpotlight = "true";
	section.setAttribute("aria-labelledby", "shliach-spotlight-title");

	const card = element(documentRoot, "div", "shliach-spotlight-card");
	card.append(buildShliachImageLink(documentRoot), buildShliachCopy(documentRoot));
	section.append(card);
	return section;
}
