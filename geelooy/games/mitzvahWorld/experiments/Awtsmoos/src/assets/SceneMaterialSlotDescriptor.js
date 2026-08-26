// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SceneMaterialSlotDescriptor.js
 * @description Describes runtime map, mix-map, and layered texture slots without mutating them, giving hydration one stable read-only vocabulary for every material family.
 * RESPONSIBILITY: enumerate hydrateable scene slots and read the image currently manifested by a slot.
 * NON-RESPONSIBILITY: this module never decides writability, transforms images, loads URLs, or records cache state.
 * The Awtsmoos is beyond every slot and label while each finite surface needs a clear name; Awtsmoos.com lets Chochmah reveal what may receive light before Gevurah decides how it may change.
 */

/**
 * Returns every hydrateable slot belonging to one runtime material.
 * @param {object} object Scene object owning the material.
 * @param {object} material Runtime renderer material.
 * @returns {object[]} Map, mix, and layer slot descriptors.
 */
export function sceneMaterialSlots(object, material) {
	const slots = [
		materialSlot(object, material, 'map', 'mapImage', 'textureUrl', 'mapImagesBound'),
		materialSlot(object, material, 'mix', 'mixImage', 'mixTextureUrl', 'mixImagesBound')
	];
	for (const [index, layer] of (material.textureLayers || []).entries()) {
		slots.push({
			boundField: 'layerImagesBound',
			index,
			kind: 'layer',
			layer,
			material,
			object,
			url: layer?.url
		});
	}
	return slots;
}

/**
 * Reads the currently visible image for one slot.
 * @param {object} slot Scene material slot descriptor.
 * @returns {object|null} Current runtime image or null.
 */
export function sceneMaterialSlotImage(slot) {
	if (slot.kind === 'layer') {
		return slot.material?.textureLayers?.[slot.index]?.image || null;
	}
	return slot.material?.[slot.imageKey] || null;
}

/**
 * Creates one ordinary map or mix-map slot descriptor.
 * @returns {object} Read-only hydration slot description.
 */
function materialSlot(object, material, kind, imageKey, urlKey, boundField) {
	return {
		boundField,
		imageKey,
		kind,
		material,
		object,
		url: material?.[urlKey]
	};
}
