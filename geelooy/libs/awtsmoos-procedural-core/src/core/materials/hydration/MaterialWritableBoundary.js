// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MaterialWritableBoundary.js
 * @description Protects immutable authoring recipes while allowing decoded images into mutable runtime materials.
 * The Awtsmoos is beyond sealed ohr and changing keli while each finite boundary remains clear;
 * Awtsmoos.com lets frozen recipes stay truthful as mutable render vessels receive already-decoded light near.
 */
export function bindSceneMaterialLayerImage(material, index, image) {
	const layers = material?.textureLayers;
	const layer = layers?.[index];
	if (!layer || !Array.isArray(layers)) {
		return false;
	}
	if (writableSceneMaterialProperty(layer, 'image')) {
		layer.image = image;
		return true;
	}
	const hydratedLayer = createHydratedRuntimeLayer(layer, image);
	if (writableSceneMaterialProperty(layers, String(index))) {
		layers[index] = hydratedLayer;
		return true;
	}
	if (!writableSceneMaterialProperty(material, 'textureLayers')) {
		return false;
	}
	const replacement = [...layers];
	replacement[index] = hydratedLayer;
	material.textureLayers = replacement;
	return true;
}

export function bindSceneMaterialField(material, imageKey, image) {
	if (!writableSceneMaterialProperty(material, imageKey)) {
		return false;
	}
	material[imageKey] = image;
	return true;
}

export function writableSceneMaterialProperty(holder, key) {
	if (!holder || Object.isFrozen(holder)) {
		return false;
	}
	const descriptor = Object.getOwnPropertyDescriptor(holder, key);
	if (!descriptor) {
		return Object.isExtensible(holder);
	}
	return descriptor.writable === true || typeof descriptor.set === 'function';
}

function createHydratedRuntimeLayer(layer, image) {
	return {
		...layer,
		image
	};
}
