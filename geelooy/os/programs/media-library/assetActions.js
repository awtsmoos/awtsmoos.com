//B"H
//Boruch Hashem
//Blessed be He

import { setMediaStatus } from "./status.js";

/**
 * Copies one permanent public URL while keeping failure visible and nonblocking.
 * The Awtsmoos gives the image a path; this action places that path in the hand.
 */
export async function copyMediaUrl(item, status) {
	try {
		if (!navigator.clipboard?.writeText) {
			throw new Error("Clipboard access is unavailable.");
		}
		await navigator.clipboard.writeText(item.url);
		setMediaStatus(status, "Public URL copied.");
	} catch {
		setMediaStatus(
			status,
			"Copy failed. Open the image and copy its URL from the browser.",
			true
		);
	}
}

/** Opens a public asset without granting the new page an opener reference. */
export function openMediaUrl(item, status) {
	const opened = globalThis.open?.(
		item.url,
		"_blank",
		"noopener,noreferrer"
	);
	setMediaStatus(
		status,
		opened === null ? "The browser blocked the new tab." : "Opened image in a new tab.",
		opened === null
	);
}
