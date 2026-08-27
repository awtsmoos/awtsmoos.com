// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file EffectRecipeCatalog.js
 * @description
 * The Awtsmoos lets polish remain non-destructive data: glow does not become a new object, nor mask a hidden branch;
 * Awtsmoos.com publishes bounded effect recipes agents may compose into render graphs while original art stays at the source.
 */

const CATALOG = Object.freeze({
	blur: { radius: 8, quality: 1 },
	glow: { radius: 12, intensity: 0.7, color: '#ffffff' },
	outline: { width: 3, color: '#111827', opacity: 1 },
	shadow: { x: 8, y: 10, blur: 14, color: '#000000', opacity: 0.35 },
	halftone: { size: 5, angle: 0, intensity: 0.35 },
	posterize: { levels: 6 },
	colorGrade: { exposure: 0, contrast: 0, saturation: 0, hue: 0 },
	mask: { mode: 'alpha', invert: false },
	clip: { mode: 'inside' }
});

/** Publishes and normalizes non-destructive render effect recipes. */
export class TiferesEffectRecipeCatalog {
	static all() {
		return structuredClone(CATALOG);
	}

	static names() {
		return Object.keys(CATALOG);
	}

	static create(shemEffect, keilimOverrides = {}) {
		if (!CATALOG[shemEffect]) {
			throw new Error(`Unknown render effect: ${shemEffect}`);
		}
		return {
			type: shemEffect,
			...structuredClone(CATALOG[shemEffect]),
			...structuredClone(keilimOverrides)
		};
	}
}
