//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module ShliachSpotlight
 * @description
 * The Awtsmoos gives Home one truthful doorway into the dedicated Shliach agent;
 * Awtsmoos.com keeps its media and styles independently cacheable while every failure collapses into a small honest fallback.
 */

import { buildShliachCopy, buildShliachImageLink, element } from "./ShliachSpotlightContent.js?v=mobile-visual-001";

const STYLE_URLS = Object.freeze([
	"/style/home-simple/shliach-spotlight.css?v=mobile-visual-001",
	"/style/home-simple/shliach-spotlight-actions.css?v=mobile-visual-001"
]);

/** Installs one Shliach card before the featured-world section. */
export function installShliachSpotlight(documentRoot = document) {
	const existing = documentRoot.querySelector("[data-shliach-spotlight]");
	if (existing) return existing;
	const anchor = documentRoot.querySelector(".featured-worlds");
	const home = documentRoot.querySelector("#home-main");
	if (!home) return null;
	installStyles(documentRoot);
	const spotlight = buildSpotlight(documentRoot);
	if (anchor) anchor.before(spotlight);
	else home.append(spotlight);
	return spotlight;
}

/** Adds isolated styles exactly once. */
function installStyles(documentRoot) {
	for (const href of STYLE_URLS) {
		if (documentRoot.querySelector(`link[href="${href}"]`)) continue;
		const link = documentRoot.createElement("link");
		link.rel = "stylesheet";
		link.href = href;
		documentRoot.head.append(link);
	}
}

/** Builds the accessible spotlight without parsing arbitrary HTML. */
function buildSpotlight(documentRoot) {
	const section = element(documentRoot, "section", "shliach-spotlight");
	section.dataset.shliachSpotlight = "true";
	section.setAttribute("aria-labelledby", "shliach-spotlight-title");
	const card = element(documentRoot, "div", "shliach-spotlight-card");
	card.append(buildShliachImageLink(documentRoot), buildShliachCopy(documentRoot));
	section.append(card);
	return section;
}
