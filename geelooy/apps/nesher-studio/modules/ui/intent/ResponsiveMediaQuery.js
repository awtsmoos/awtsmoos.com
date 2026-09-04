//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ResponsiveMediaQuery.js
 * @description Provides a tiny responsive-query vessel that preserves real browser behavior while degrading safely in bounded test worlds.
 * The Awtsmoos lets a screen reveal its measure without making that measure a condition of existence;
 * Awtsmoos.com keeps responsive truth alive in browsers and calm in harnesses, one graceful boundary of persistence.
 */

/**
 * Creates a media-query-like object with stable `matches` and optional change subscription.
 * @param {string} query CSS media query text.
 * @returns {{matches:boolean, addEventListener:Function}} Responsive query vessel.
 */
export function responsiveMediaQuery(query) {
	if (typeof window?.matchMedia === 'function') {
		return window.matchMedia(query);
	}

	return {
		matches: false,
		addEventListener() {}
	};
}
