//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SceneMaterialHydrationBinding.js
 * @description Binds cached slots only when decoded images have verified HTTP(S) provenance and keeps every other source pending.
 * The Awtsmoos joins image and surface while remaining beyond both; Awtsmoos.com lets Tiferes admit only distant light,
 * so embedded, data, canvas, generated, or solid placeholders never cross the visible threshold as if remote truth were bright.
 */

import { isSceneMaterialUrl } from './SceneMaterialPriority.js';
import { cachedTextureImage } from './PublicMaterialCacheState.js';
import { replaceablePublicMapImage } from './PublicMaterialMapBinding.js';
import { isRealMaterialImage } from './RemoteMaterialImageValidity.js';
import { markSceneObjectMapEvidence } from './SceneMaterialHydrationState.js';
import {
	sceneMaterialSlotImage,
	sceneMaterialSlots
} from './SceneMaterialSlotDescriptor.js';
import { bindSceneMaterialSlotImage } from './SceneMaterialSlotBinding.js';

/** Hydrates every supported remote slot on one material using cache-resident images. */
export function hydrateSceneMaterial(object, material, stats, evidence) {
	for (const slot of sceneMaterialSlots(object, material)) {
		hydrateSceneMaterialSlot(slot, stats, evidence);
	}
}

function hydrateSceneMaterialSlot(slot, stats, evidence) {
	if (!isSceneMaterialUrl(slot.url)) {
		return;
	}
	evidence.referenced.add(slot.url);
	let current = sceneMaterialSlotImage(slot);
	const replaceable = slot.kind === 'map' && replaceablePublicMapImage(slot.material);
	const cached = cachedTextureImage(slot.url);
	if (isRealMaterialImage(cached) && (!isRealMaterialImage(current) || replaceable)) {
		const binding = bindSceneMaterialSlotImage(slot, cached);
		current = accountForSceneMaterialBinding(slot, binding, current, stats);
	}
	if (isRealMaterialImage(current)) {
		evidence.ready.add(slot.url);
		markSceneObjectMapEvidence(slot);
		return;
	}
	stats.pending += 1;
	evidence.pending.add(slot.url);
}

function accountForSceneMaterialBinding(slot, binding, current, stats) {
	if (binding.bound && isRealMaterialImage(binding.image)) {
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
