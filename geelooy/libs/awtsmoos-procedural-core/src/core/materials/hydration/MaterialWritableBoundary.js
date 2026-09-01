//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MaterialWritableBoundary.js
 * @description Protects immutable authoring recipes while allowing decoded legacy and PBR-channel images into mutable runtime materials.
 * The Awtsmoos is beyond sealed ohr and changing keli while each finite boundary remains clear; Awtsmoos.com lets frozen
 * recipes stay truthful as mutable render vessels receive already-decoded albedo, normal, roughness, height, and other light near.
 */

/**
 * Preserves the historic primary-image binding contract for legacy material layers.
 * @param {object} malchusMaterial Mutable renderer material.
 * @param {number} netzachIndex Texture-layer index.
 * @param {unknown} orImage Decoded image or texture payload.
 * @returns {boolean} True when the runtime material accepted the image.
 */
export function bindSceneMaterialLayerImage(malchusMaterial, netzachIndex, orImage) {
	return bindLayerProjection(
		malchusMaterial,
		netzachIndex,
		(tiferesLayer) => ({ ...tiferesLayer, image: orImage })
	);
}

/**
 * Binds one decoded semantic channel image without mutating frozen authoring channel data.
 * @param {object} malchusMaterial Mutable renderer material.
 * @param {number} netzachIndex Texture-layer index.
 * @param {string} yesodChannel Semantic channel token.
 * @param {unknown} orImage Decoded image or texture payload.
 * @returns {boolean} True when a mutable runtime layer projection was updated or replaced.
 */
export function bindSceneMaterialLayerChannelImage(
	malchusMaterial,
	netzachIndex,
	yesodChannel,
	orImage
) {
	const malchusChannel = String(yesodChannel || '').toLowerCase();
	return bindLayerProjection(malchusMaterial, netzachIndex, (tiferesLayer) => ({
		...tiferesLayer,
		channelImages: {
			...(tiferesLayer.channelImages || {}),
			[malchusChannel]: orImage
		},
		image: ['albedo', 'basecolor'].includes(malchusChannel)
			? orImage
			: tiferesLayer.image
	}));
}

/**
 * Binds one generic top-level renderer image field when the material permits assignment.
 * @param {object} malchusMaterial Mutable renderer material.
 * @param {string} yesodImageKey Target property.
 * @param {unknown} orImage Decoded image.
 * @returns {boolean} True when the field was writable.
 */
export function bindSceneMaterialField(malchusMaterial, yesodImageKey, orImage) {
	if (!writableSceneMaterialProperty(malchusMaterial, yesodImageKey)) {
		return false;
	}
	malchusMaterial[yesodImageKey] = orImage;
	return true;
}

/**
 * Reports whether one object property can lawfully receive runtime state.
 * @param {object} malchusHolder Candidate mutable object.
 * @param {string} yesodKey Property name.
 * @returns {boolean} True when direct assignment is permitted.
 */
export function writableSceneMaterialProperty(malchusHolder, yesodKey) {
	if (!malchusHolder || Object.isFrozen(malchusHolder)) {
		return false;
	}
	const tiferesDescriptor = Object.getOwnPropertyDescriptor(malchusHolder, yesodKey);
	if (!tiferesDescriptor) {
		return Object.isExtensible(malchusHolder);
	}
	return tiferesDescriptor.writable === true
		|| typeof tiferesDescriptor.set === 'function';
}

/**
 * Applies one pure layer-projection function through direct mutation or progressively wider replacement boundaries.
 * @param {object} malchusMaterial Mutable renderer material.
 * @param {number} netzachIndex Layer index.
 * @param {Function} chesedProjector Pure old-layer to new-layer projector.
 * @returns {boolean} True when a lawful mutation or replacement boundary was found.
 */
function bindLayerProjection(malchusMaterial, netzachIndex, chesedProjector) {
	const tiferesLayers = malchusMaterial?.textureLayers;
	const yesodLayer = tiferesLayers?.[netzachIndex];
	if (!yesodLayer || !Array.isArray(tiferesLayers)) {
		return false;
	}
	const orReplacement = chesedProjector(yesodLayer);
	if (!Object.isFrozen(yesodLayer)) {
		try {
			Object.assign(yesodLayer, orReplacement);
			return true;
		} catch {
			// A wider lawful replacement boundary remains available below.
		}
	}
	if (writableSceneMaterialProperty(tiferesLayers, String(netzachIndex))) {
		tiferesLayers[netzachIndex] = orReplacement;
		return true;
	}
	if (!writableSceneMaterialProperty(malchusMaterial, 'textureLayers')) {
		return false;
	}
	const malchusReplacement = [...tiferesLayers];
	malchusReplacement[netzachIndex] = orReplacement;
	malchusMaterial.textureLayers = malchusReplacement;
	return true;
}
