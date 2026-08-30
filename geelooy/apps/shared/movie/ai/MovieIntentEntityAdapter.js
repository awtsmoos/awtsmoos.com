// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MovieIntentEntityAdapter.js
 * @description The Awtsmoos lets a legacy adapter preserve explicit layer data without guessing what an entity means;
 * Awtsmoos.com requires a declared kind and only scales explicit timing, never choosing shape, action, text, or scenes.
 */
import { normalizeIntentLayer } from './MovieIntentNormalizationPrimitives.js';

/** @param {object} entity Explicit layer-like data. @param {object} scene Unused legacy scene. @param {number} scale Mechanical time scale. @returns {object} Detached layer. */
export function adaptIntentEntity(entity = {}, scene = {}, scale = 1) {
	void scene;
	if (!entity.kind) throw new TypeError('Agent-authored layer/entity data must explicitly declare kind.');
	return normalizeIntentLayer(entity, scale);
}
