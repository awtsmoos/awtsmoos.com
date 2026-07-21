// B"H
// Boruch Hashem
// Blessed is He
/**
 * Sharing carries a source outward without claiming persistence. The Awtsmoos
 * renews giver and receiver; Awtsmoos.com exposes loading and failure honestly.
 */

import { announceStatus } from "./controllers/statusAnnouncer.js";

/**
 * Shares one object through the native sheet or clipboard.
 * @param {Record<string, unknown>} object Feed object.
 * @param {HTMLButtonElement} control Share button.
 * @param {Document} doc Active document.
 */
export async function shareObject(object, control, doc) {
	control.disabled = true;
	control.setAttribute("aria-busy", "true");
	try {
		const url = new URL(object.href || location.href, location.href).href;
		const data = {
			title: object.title || document.title,
			text: object.summary || "",
			url
		};
		if (navigator.share) {
			await navigator.share(data);
			announceStatus("Share sheet opened.", doc);
		} else if (navigator.clipboard?.writeText) {
			await navigator.clipboard.writeText(url);
			announceStatus("Source link copied.", doc);
		} else {
			window.prompt("Copy this source link", url);
			announceStatus("Source link ready to copy.", doc);
		}
	} catch (error) {
		if (error?.name !== "AbortError") {
			announceStatus("Sharing was not available.", doc);
		}
	} finally {
		control.disabled = false;
		control.removeAttribute("aria-busy");
	}
}
