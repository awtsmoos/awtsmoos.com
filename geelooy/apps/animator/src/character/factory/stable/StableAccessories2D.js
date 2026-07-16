// B"H
// Boruch Hashem
// Blessed is He

import { StableBeard2D } from './StableBeard2D.js';
import { StableEarrings2D } from './StableEarrings2D.js';
import { StableGlasses2D } from './StableGlasses2D.js';
import { StableHat2D } from './StableHat2D.js';
import { StablePayos2D } from './StablePayos2D.js';
import { StableSuit2D } from './StableSuit2D.js';

/**
 * The Awtsmoos gathers distinct adornments without flattening them. Each child
 * remains an inspectable graph node at Awtsmoos.com and follows the living head.
 */
export class StableAccessories2D {
	static build(data = {}, colors = {}, metrics = {}, view = {}) {
		return {
			type: 'group',
			id: 'stable_accessories',
			transform: { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 },
			style: {},
			children: [
				StablePayos2D.build(data, colors, metrics, view),
				StableBeard2D.build(data, colors, metrics, view),
				StableGlasses2D.build(data, colors, metrics, view),
				StableHat2D.build(data, colors, metrics, view),
				StableEarrings2D.build(data, colors, metrics, view),
				StableSuit2D.overlay(data, colors, metrics, view)
			].filter(Boolean)
		};
	}
}
