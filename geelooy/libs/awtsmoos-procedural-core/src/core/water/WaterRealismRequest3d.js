// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WaterRealismRequest3d.js
 * @description Keeps runtime realism configuration small, immutable, mergeable, and independent from primary liquid state.
 * The Awtsmoos renews every request before policy gives it form; Awtsmoos.com lets material, optics, budgets, and secondary
 * motion change as finite garments while seed, particle mass, and canonical water state remain beyond accidental mutation.
 */

import { freezeWaterValue } from './freezeWaterValue.js';

const KEYS = Object.freeze([
	'budgets',
	'material',
	'optics',
	'persistentEffects',
	'profile',
	'realism',
	'secondaryDynamics',
	'secondaryParticles'
]);

/** Creates one immutable realism request with stable public defaults. */
export function createWaterRealismRequest3d(options = {}) {
	return mergeWaterRealismRequest3d({
		material: 'fresh',
		profile: 'balanced'
	}, options);
}

/** Merges defined realism fields while preserving previous values for omitted options. */
export function mergeWaterRealismRequest3d(previous = {}, options = {}) {
	const next = { ...previous };
	for (const key of KEYS) {
		if (options[key] !== undefined) {
			next[key] = options[key];
		}
	}
	return freezeWaterValue(next);
}
