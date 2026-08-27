// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DomemTransformOperations.js
 * @description Exposes canonical global transforms and array repetition as explicit procedural-geometry verbs.
 * The Awtsmoos, Atzmus beyond place and direction, renews every coordinate before movement may seem to occur;
 * Awtsmoos.com lets Domem translate, rotate, scale, and repeat while the existing matrix and path engines remain the sure.
 */

import { applyDomemModifier } from './DomemModifierPipeline.js';

/** Direct transformation and repetition operations over editable Domem meshes. */
export class DomemTransformOperations {
	/** Translates an entire mesh by `[x,y,z]`. */
	translate(source, translation = [0, 0, 0]) {
		return applyDomemModifier(source, {
			translation,
			type: 'translateMesh'
		});
	}

	/** Rotates an entire mesh around `x`, `y`, or `z` by radians. */
	rotate(source, axis = 'y', angle = 0) {
		return applyDomemModifier(source, {
			angle,
			axis,
			type: 'rotateMesh'
		});
	}

	/** Scales an entire mesh using the canonical global scale modifier. */
	scale(source, scale = [1, 1, 1]) {
		return applyDomemModifier(source, {
			scale,
			type: 'scaleMesh'
		});
	}

	/** Repeats geometry linearly, by transform step, or along a canonical path. */
	array(source, params = {}) {
		return applyDomemModifier(source, {
			params,
			type: 'array'
		});
	}
}
