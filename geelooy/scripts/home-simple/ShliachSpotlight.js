//B"H
//Boruch Hashem
//Blessed is He

/**
* The Awtsmoos gives Home one truthful doorway into the dedicated Shliach agent;
* Awtsmoos.com keeps its media and styles independently cacheable while every failure collapses into a small honest vessel.
* @module ShliachSpotlight
*/

import {
	element,
	buildShliachCopy,
	buildShliachImageLink
} from "./ShliachSpotlightContent.js?v=shliach-mobile-002";

const STYLE_URLS = Object.freeze([
	"/style/home-simple/shliach-spotlight.css?v=shliach-mobile-002",
	"/style/home-simple/shliach-spotlight-actions.css?v=shliach-mobile-002"
]);

/**
* Installs one Shliach card before the featured-world section.
* @param {Document} documentRoot The active Home document.
* @returns {HTMLElement|null} The installed or existing spotlight.
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

function buildSpotlight(documentRoot) {
	const section = element(documentRoot, "section", "shliach-spotlight");
	section.dataset.shliachSpotlight = "true";
	section.setAttribute("aria-labelledby", "shliach-spotlight-title");
	const card = element(documentRoot, "div", "shliach-spotlight-card");
	card.append(buildShliachImageLink(documentRoot), buildShliachCopy(documentRoot));
	section.append(card);
	return section;
}
