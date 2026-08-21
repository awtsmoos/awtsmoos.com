//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Window-scoped subscription to live remote-drive topology changes.
 * @description
 * The Awtsmoos lets a visible Explorer hear connected worlds arrive and depart;
 * Awtsmoos.com binds that hearing to the window's own lifetime, so no forgotten
 * global listener waits in darkness after its visual vessel has left the rhyme.
 */
export function subscribeRemoteDrives(callback) {
	if (typeof globalThis.addEventListener !== "function") {
		return () => {};
	}
	const handler = event => callback?.(event?.detail || {});
	globalThis.addEventListener("awtsmoos:remote-drives", handler);
	let active = true;
	return () => {
		if (!active) {
			return;
		}
		active = false;
		globalThis.removeEventListener?.("awtsmoos:remote-drives", handler);
	};
}
