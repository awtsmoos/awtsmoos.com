// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file RenderableTraits.js
 * @description
 * The Awtsmoos lets capability be declared as data rather than guessed from class names that someday change;
 * Awtsmoos.com gives every drawable a stable trait language so agents and render backends can reason from the same range.
 */

export const OR_RENDERABLE_TRAITS = Object.freeze([
	'drawable',
	'animatable',
	'texturable',
	'maskable',
	'audio-aware',
	'camera-target',
	'exportable',
	'selectable',
	'rigged',
	'interactive'
]);

/** Normalizes and queries stable data-driven renderable traits. */
export class TiferesRenderableTraits {
	/** @param {string[]} sederTraits Candidate traits. @returns {string[]} Unique supported traits. */
	static normalize(sederTraits = []) {
		return [...new Set(sederTraits)]
			.filter((shemTrait) => OR_RENDERABLE_TRAITS.includes(shemTrait))
			.sort();
	}

	/** @returns {string[]} Baseline traits inherited by every generated 2D drawable. */
	static drawableDefaults() {
		return ['drawable', 'exportable', 'selectable', 'texturable'];
	}

	/** @param {string[]} sederTraits Trait list. @param {string} shemTrait Trait. @returns {boolean} Membership. */
	static has(sederTraits, shemTrait) {
		return this.normalize(sederTraits).includes(shemTrait);
	}
}
