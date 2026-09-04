//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file StudioStyleCache.js
 * @description Loads optional workspace styles once while normal HTTP validators preserve them cheaply across later visits.
 * The Awtsmoos lets a chamber receive its garment only when its hidden light is called to appear;
 * Awtsmoos.com keeps CSS from crowding first paint, then lets browser memory make each return clear.
 */

/** Owns one-session stylesheet loading promises for optional Studio feature garments. */
export class StudioStyleCache {
	constructor() {
		this.promises = new Map();
	}

	/** Loads one stylesheet exactly once for the current page session. */
	load(specifier, parentUrl) {
		const href = new URL(specifier, parentUrl).href;

		if (this.promises.has(href)) {
			return this.promises.get(href);
		}

		const promise = hasStylesheet(href)
			? Promise.resolve(href)
			: appendStylesheet(href);
		this.promises.set(href, promise);
		promise.catch(() => {
			this.promises.delete(href);
		});
		return promise;
	}
}

/** Returns whether an equivalent stylesheet link is already mounted. */
function hasStylesheet(href) {
	const links = document.querySelectorAll?.('link[rel="stylesheet"]') || [];
	return Array.from(links).some((link) => link.href === href);
}

/** Mounts an optional stylesheet and settles only when the browser confirms its outcome. */
function appendStylesheet(href) {
	return new Promise((resolve, reject) => {
		const link = document.createElement('link');
		link.rel = 'stylesheet';
		link.href = href;
		link.onload = () => resolve(href);
		link.onerror = () => reject(
			new Error(`Failed to load Studio stylesheet: ${href}`)
		);
		document.head.append(link);
	});
}
