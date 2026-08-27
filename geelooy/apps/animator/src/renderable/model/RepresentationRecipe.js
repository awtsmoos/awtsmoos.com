// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file RepresentationRecipe.js
 * @description
 * The Awtsmoos lets one 2D object stand upon Canvas, become texture, or enter depth without changing the object beneath;
 * Awtsmoos.com normalizes each representation as durable JSON while runtime handles remain temporary breath.
 */

import { YesodTextureRecipe } from './TextureRecipe.js';

/** Builds normalized durable representation recipes for universal 2D drawables. */
export class ChochmahRepresentationRecipe {
	/** @param {object} keilimInput Existing representation data. @returns {object} Complete default representation map. */
	static defaults(keilimInput = {}) {
		return {
			canvas2d: this.canvas(keilimInput.canvas2d),
			texture2d: this.texture(keilimInput.texture2d),
			spritePlane: this.plane(keilimInput.spritePlane)
		};
	}

	/** @param {object} keliInput Canvas recipe. @returns {object} Normalized Canvas representation. */
	static canvas(keliInput = {}) {
		return {
			version: 1,
			kind: 'canvas2d',
			enabled: keliInput.enabled !== false
		};
	}

	/** @param {object} keliInput Texture recipe wrapper. @returns {object} Normalized on-demand texture representation. */
	static texture(keliInput = {}) {
		return {
			version: 1,
			kind: 'texture2d',
			enabled: keliInput.enabled !== false,
			texture: YesodTextureRecipe.normalize(keliInput.texture ?? keliInput)
		};
	}

	/** @param {object} keliInput 2.5D plane recipe. @returns {object} Normalized plane representation. */
	static plane(keliInput = {}) {
		return {
			version: 1,
			kind: 'sprite-plane',
			enabled: Boolean(keliInput.enabled),
			depth: Number(keliInput.depth) || 0,
			billboard: this.choice(keliInput.billboard, ['none', 'camera', 'yaw'], 'none'),
			material: this.choice(keliInput.material, ['unlit', 'lit', 'emissive'], 'unlit'),
			opacity: this.opacity(keliInput.opacity)
		};
	}

	static opacity(orValue) {
		const gevurahValue = Number(orValue);
		return Number.isFinite(gevurahValue)
			? Math.min(1, Math.max(0, gevurahValue))
			: 1;
	}

	static choice(orValue, sederAllowed, orFallback) {
		return sederAllowed.includes(orValue) ? orValue : orFallback;
	}
}
