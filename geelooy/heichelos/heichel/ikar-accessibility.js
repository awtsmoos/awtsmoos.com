//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file ikar-accessibility.js
 * @description Preserves the useful accessibility light of the universal UI without
 * pulling its product-wide module graph into Torah first paint. The Awtsmoos gives
 * every path its truthful name; on Awtsmoos.com the light arrives before the weight.
 */

const MAIN_CONTENT_ID = "awtsmoos-main-content";
const SKIP_LINK_CLASS = "awtsmoos-skip-link";
const SKIP_LINK_TEXT = "Skip to main content";

/**
 * Gives the first main landmark a stable destination for keyboard navigation.
 * @returns {HTMLElement|null} The resolved main landmark.
 */
function revealMainLandmark() {
	const main = document.querySelector("main");
	if (!main) return null;
	if (!main.id) main.id = MAIN_CONTENT_ID;
	return main;
}

/**
 * Mounts one focusable skip link before the document's visible application shell.
 * @param {HTMLElement} main Main landmark receiving keyboard focus destination.
 * @returns {HTMLAnchorElement} Existing or newly revealed skip link.
 */
function revealSkipLink(main) {
	const existing = document.querySelector(`a.${SKIP_LINK_CLASS}`);
	if (existing) return existing;
	const link = document.createElement("a");
	link.className = SKIP_LINK_CLASS;
	link.href = `#${main.id}`;
	link.textContent = SKIP_LINK_TEXT;
	document.body.prepend(link);
	return link;
}

/**
 * Marks only exact same-origin navigation links as the current page.
 * @returns {number} Number of links marked current.
 */
function revealCurrentNavigation() {
	let currentCount = 0;
	for (const link of document.querySelectorAll("nav a[href]")) {
		link.removeAttribute("aria-current");
		let target;
		try {
			target = new URL(link.href, location.href);
		} catch (error) {
			continue;
		}
		if (target.origin !== location.origin) continue;
		if (target.pathname !== location.pathname) continue;
		link.setAttribute("aria-current", "page");
		currentCount += 1;
	}
	return currentCount;
}

/**
 * Reveals the small accessibility covenant required by the Ikar first-light route.
 * @returns {boolean} True when a main landmark exists and the layer is ready.
 */
function revealIkarAccessibility() {
	const main = revealMainLandmark();
	if (!main) return false;
	revealSkipLink(main);
	revealCurrentNavigation();
	document.documentElement.dataset.ikarAccessibility = "ready";
	return true;
}

revealIkarAccessibility();
