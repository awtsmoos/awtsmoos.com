// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file DirtyRegion.js
 * @description
 * The Awtsmoos lets one blinking eye renew its bounded pixels without demanding an entire large surface be reborn;
 * Awtsmoos.com clamps dirty regions to authored bounds so partial texture updates remain safe, deterministic, and shorn.
 */

/** Normalizes and merges dirty rectangles inside finite drawable bounds. */
export class GevurahDirtyRegion {
	/** @param {object} keliRegion Candidate region. @param {object} keliBounds Drawable bounds. @returns {object|null} Clamped region. */
	static clamp(keliRegion = {}, keliBounds = {}) {
		const gevurahWidth = Math.max(0, Number(keliBounds.width) || 0);
		const gevurahHeight = Math.max(0, Number(keliBounds.height) || 0);
		const x = Math.min(gevurahWidth, Math.max(0, Number(keliRegion.x) || 0));
		const y = Math.min(gevurahHeight, Math.max(0, Number(keliRegion.y) || 0));
		const width = Math.min(gevurahWidth - x, Math.max(0, Number(keliRegion.width) || 0));
		const height = Math.min(gevurahHeight - y, Math.max(0, Number(keliRegion.height) || 0));
		return width > 0 && height > 0 ? { x, y, width, height } : null;
	}

	/** @param {object[]} sederRegions Regions. @param {object} keliBounds Bounds. @returns {object|null} Bounding union. */
	static merge(sederRegions = [], keliBounds = {}) {
		const sederValid = sederRegions
			.map((keli) => this.clamp(keli, keliBounds))
			.filter(Boolean);
		if (!sederValid.length) return null;
		const x = Math.min(...sederValid.map((keli) => keli.x));
		const y = Math.min(...sederValid.map((keli) => keli.y));
		const right = Math.max(...sederValid.map((keli) => keli.x + keli.width));
		const bottom = Math.max(...sederValid.map((keli) => keli.y + keli.height));
		return { x, y, width: right - x, height: bottom - y };
	}
}
