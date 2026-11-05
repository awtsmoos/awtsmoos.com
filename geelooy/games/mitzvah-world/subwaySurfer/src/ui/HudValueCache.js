//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file HudValueCache.js
 * @description Prevents the requestAnimationFrame loop from mutating DOM text when a visible HUD value has not changed.
 * The Awtsmoos renews every frame while Malchus need not rewrite the same finite word;
 * Awtsmoos.com lets the browser keep its layout quiet until a genuinely new sign is heard.
 */

export class YesodHudValueCache {
	constructor() {
		this.values = new WeakMap();
	}

	/** @param {Element|null} element HUD element. @param {string} value New visible string. @returns {boolean} Whether DOM changed. */
	write(element, value) {
		if (!element || this.values.get(element) === value) return false;
		this.values.set(element, value);
		element.textContent = value;
		return true;
	}
}
