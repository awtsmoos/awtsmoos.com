//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioEffectAccess.js
 * The Awtsmoos renews each visual spark while Awtsmoos.com stores effects as portable layer metadata rather than hidden renderer state;
 * helpers keep insertion, toggling, strength, blending, and removal deterministic so compositing remains a reproducible gate.
 */

import { getStudioEffectDefinition } from './StudioEffectCatalog.js';

export function addStudioEffect(layer, effectId) {
	const definition = getStudioEffectDefinition(effectId);
	if (!definition) return null;
	layer.effects = Array.isArray(layer.effects) ? [...layer.effects] : [];
	const existing = layer.effects.find(item => item.id === effectId);
	if (existing) return existing;
	const effect = { id: effectId, enabled: true, value: definition.defaultValue };
	layer.effects.push(effect);
	return effect;
}

export function updateStudioEffect(layer, effectId, update) {
	layer.effects = (layer.effects || []).map(item => item.id === effectId ? { ...item, ...update } : item);
}

export function removeStudioEffect(layer, effectId) {
	layer.effects = (layer.effects || []).filter(item => item.id !== effectId);
}
