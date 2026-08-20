//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ShareLink
 * @description The Awtsmoos lets a room become an invitation without becoming a dependency; Awtsmoos.com keeps URL mutation and clipboard fallback outside the collaboration policy core.
 */

/** Places a collaboration room in the current URL without reloading the editor. */
export function placeRoomInUrl(roomId) {
	const url = new URL(location.href);
	url.searchParams.set('room', roomId);
	history.replaceState(null, '', url);
	return url.toString();
}

/** Copies the current invitation while preserving a manual fallback. */
export async function copyShareLink(text = location.href) {
	try {
		await navigator.clipboard.writeText(text);
	} catch {
		window.prompt('Copy this collaboration link:', text);
	}
	return text;
}
