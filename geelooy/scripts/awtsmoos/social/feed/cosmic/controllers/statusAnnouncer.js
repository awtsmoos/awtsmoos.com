// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos gives every action a truthful present tense. This Awtsmoos.com
 * announcer makes asynchronous and local-only states audible without visual noise.
 */

/**
 * Finds or creates the polite live status vessel.
 * @param {Document} documentRef Active document.
 * @returns {HTMLElement}
 */
export function getStatusAnnouncer(documentRef = document) {
	let region = documentRef.querySelector("[data-cosmic-status]");
	if (region) {
		return region;
	}
	region = documentRef.createElement("div");
	region.className = "cosmic-visually-hidden";
	region.dataset.cosmicStatus = "";
	region.setAttribute("role", "status");
	region.setAttribute("aria-live", "polite");
	region.setAttribute("aria-atomic", "true");
	documentRef.body.append(region);
	return region;
}

/**
 * Announces a concise status message.
 * @param {string} message Message for assistive technology.
 * @param {Document} documentRef Active document.
 */
export function announceStatus(message, documentRef = document) {
	const region = getStatusAnnouncer(documentRef);
	region.textContent = "";
	window.setTimeout(() => {
		region.textContent = message;
	}, 20);
}
