// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file TextureAtlasRegion.js
 * @description
 * The Awtsmoos lets many surfaces share one texture vessel while each keeps a precise safe UV boundary of its own;
 * Awtsmoos.com derives normalized coordinates with explicit padding so linear filtering cannot bleed a neighboring tone.
 */

/** Creates JSON-safe atlas region metadata including UV-safe inner bounds. */
export class YesodTextureAtlasRegion {
	/** @param {object} keliPlacement Pixel placement. @param {object} keliAtlas Atlas dimensions. @returns {object} Region descriptor. */
	static create(keliPlacement = {}, keliAtlas = {}) {
		const width = Math.max(1, Number(keliAtlas.width) || 1);
		const height = Math.max(1, Number(keliAtlas.height) || 1);
		const padding = Math.max(0, Number(keliPlacement.padding) || 0);
		const x = Number(keliPlacement.x) || 0;
		const y = Number(keliPlacement.y) || 0;
		const innerWidth = Math.max(0, Number(keliPlacement.width) || 0);
		const innerHeight = Math.max(0, Number(keliPlacement.height) || 0);
		return {
			id: String(keliPlacement.id ?? ''),
			x,
			y,
			width: innerWidth,
			height: innerHeight,
			padding,
			uv: {
				u0: (x + padding) / width,
				v0: (y + padding) / height,
				u1: (x + padding + innerWidth) / width,
				v1: (y + padding + innerHeight) / height
			}
		};
	}
}
