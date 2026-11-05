// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SceneMaterialSlotBinding.js
 * @description Coordinates image preparation and immutable-safe runtime binding while descriptor and writable-boundary collaborators keep reading separate from mutation.
 * RESPONSIBILITY: prepare map images, choose layer versus ordinary field binding, publish successful map evidence, and return one stable binding receipt.
 * NON-RESPONSIBILITY: this module does not enumerate slots, fetch URLs, traverse scenes, or implement low-level property writability.
 * The Awtsmoos harmonizes light and vessel without breaking either form; Awtsmoos.com lets Tiferes join transformed image with protected runtime boundary so the living frame stays warm.
 */

import { isUsableMaterialImage } from './PublicMaterialCacheState.js';
import {
	markRealPublicMapImage,
	preparePublicMapImage
} from './PublicMaterialMapBinding.js';
import { sceneMaterialSlotImage } from './SceneMaterialSlotDescriptor.js';
import {
	bindSceneMaterialField,
	bindSceneMaterialLayerImage
} from './SceneMaterialWritableBoundary.js';

/** Binds one decoded image without mutating frozen recipe objects. */
export function bindSceneMaterialSlotImage(slot, image) {
	const prepared = prepareSlotImage(slot, image);
	if (!prepared) {
		return bindingResult(false, null, false, slot.kind === 'map');
	}
	const bound = bindPreparedSlot(slot, prepared);
	if (bound && slot.kind === 'map') {
		markRealPublicMapImage(slot.object, slot.material);
	}
	const current = bound ? sceneMaterialSlotImage(slot) : null;
	return bindingResult(bound, current, !bound, false);
}

/**
 * Applies the optional map transform while layered/mix images pass through unchanged.
 * @param {object} slot Slot descriptor.
 * @param {object} image Source decoded image.
 * @returns {object|null} Prepared image or null when a map transform cannot complete.
 */
function prepareSlotImage(slot, image) {
	if (slot.kind !== 'map') {
		return image;
	}
	return preparePublicMapImage(slot.material, image);
}

/**
 * Delegates the actual write to the only legal runtime mutation boundary.
 * @returns {boolean} Whether the prepared image was committed.
 */
function bindPreparedSlot(slot, image) {
	if (slot.kind === 'layer') {
		return bindSceneMaterialLayerImage(slot.material, slot.index, image);
	}
	return bindSceneMaterialField(slot.material, slot.imageKey, image);
}

/**
 * Shapes one stable binding receipt for the scene hydration coordinator.
 * @returns {object} Bound image and immutable/transform evidence.
 */
function bindingResult(bound, image, immutableSkipped, transformPending) {
	return {
		bound,
		image: isUsableMaterialImage(image) ? image : null,
		immutableSkipped,
		transformPending
	};
}
