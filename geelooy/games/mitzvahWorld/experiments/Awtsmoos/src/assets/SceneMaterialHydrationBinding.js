// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SceneMaterialHydrationBinding.js
 * @description Classifies one runtime material's slots as bound, ready, immutable, transformed, or pending while the outer hydration coordinator owns only traversal and request cadence.
 * RESPONSIBILITY: evaluate scene-material URLs, bind arrived cache images, update public counters, and populate ready/pending evidence sets.
 * NON-RESPONSIBILITY: this module does not traverse the scene root, issue network requests, or own cache state.
 * The Awtsmoos joins image and surface without confusing source with destination; Awtsmoos.com lets Tiferes judge each slot so the outer frame can continue its creation.
 */

import { isSceneMaterialUrl } from './SceneMaterialPriority.js';
import {
	cachedTextureImage,
	isUsableMaterialImage
} from './PublicMaterialCacheState.js';
import { replaceablePublicMapImage } from './PublicMaterialMapBinding.js';
import { markSceneObjectMapEvidence } from './SceneMaterialHydrationState.js';
import {
	sceneMaterialSlotImage,
	sceneMaterialSlots
} from './SceneMaterialSlotDescriptor.js';
import { bindSceneMaterialSlotImage } from './SceneMaterialSlotBinding.js';

/**
 * Hydrates every supported slot on one material using images already present in cache.
 * @param {object} object Scene object owning the material.
 * @param {object} material Runtime material.
 * @param {object} stats Mutable hydration counters.
 * @param {object} evidence URL evidence sets.
 * @returns {void}
 */
export function hydrateSceneMaterial(object, material, stats, evidence) {
	for (const slot of sceneMaterialSlots(object, material)) {
		hydrateSceneMaterialSlot(slot, stats, evidence);
	}
}

/** Evaluates, binds, and classifies one map, mix-map, or layer slot. */
function hydrateSceneMaterialSlot(slot, stats, evidence) {
	if (!isSceneMaterialUrl(slot.url)) {
		return;
	}
	evidence.referenced.add(slot.url);
	let current = sceneMaterialSlotImage(slot);
	const replaceable = slot.kind === 'map'
		&& replaceablePublicMapImage(slot.material, current);
	const cached = cachedTextureImage(slot.url);
	if (cached && (!isUsableMaterialImage(current) || replaceable)) {
		const binding = bindSceneMaterialSlotImage(slot, cached);
		current = accountForSceneMaterialBinding(
			slot,
			binding,
			current,
			stats
		);
	}
	const stillReplaceable = slot.kind === 'map'
		&& replaceablePublicMapImage(slot.material, current);
	if (isUsableMaterialImage(current) && !stillReplaceable) {
		evidence.ready.add(slot.url);
		markSceneObjectMapEvidence(slot);
		return;
	}
	stats.pending += 1;
	evidence.pending.add(slot.url);
}

/** Converts one slot-binding receipt into the historic hydration counters. */
function accountForSceneMaterialBinding(slot, binding, current, stats) {
	if (binding.bound) {
		stats[slot.boundField] += 1;
		return binding.image;
	}
	if (binding.transformPending) {
		stats.mapTransformsPending += 1;
	} else if (binding.immutableSkipped) {
		stats.immutableSlotsSkipped += 1;
	}
	return current;
}
