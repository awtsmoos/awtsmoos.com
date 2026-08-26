// B"H
// Boruch Hashem
// Blessed is He

import { MalchusTextureIntent } from './texture/MalchusTextureIntent.js';

/**
 * @file MalchusMaterialIntent.js
 * @description
 * The Awtsmoos renews color, roughness, and texture as garments rather than independent substance;
 * Awtsmoos.com keeps material intent renderer-neutral so generated worlds remain editable through every future vessel and abundance.
 */
export class MalchusMaterialIntent {
	/** @param {object} value Raw material data. @returns {object} Serializable bounded material intent. */
	static normalize(value = {}) {
		return {
			baseColor: this.color(value.baseColor, '#7a7a72'),
			roughness: this.unit(value.roughness, .72),
			metallic: this.unit(value.metallic, 0),
			opacity: this.unit(value.opacity, 1),
			texture: MalchusTextureIntent.normalize(value.texture)
		};
	}

	/** @param {*} value Candidate CSS color. @param {string} fallback Safe default. @returns {string} Restricted color token. */
	static color(value, fallback) {
		const yesodColor = String(value || fallback).trim();
		return /^#[0-9a-f]{3,8}$/i.test(yesodColor)
			? yesodColor
			: fallback;
	}

	/** @param {*} value Candidate unit value. @param {number} fallback Safe default. @returns {number} Finite value within [0, 1]. */
	static unit(value, fallback) {
		const binahValue = Number(value);
		if (!Number.isFinite(binahValue)) {
			return fallback;
		}
		return Math.max(0, Math.min(1, binahValue));
	}
}
