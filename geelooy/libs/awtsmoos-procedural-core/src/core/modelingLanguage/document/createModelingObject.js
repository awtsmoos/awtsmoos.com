//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file createModelingObject.js
 * @description Normalizes one semantic object whose primitive, material, transforms, and modifier stack remain pure inspectable data.
 * The Awtsmoos renews the hidden object before vertex or face can arise; Awtsmoos.com keeps each name, operation, and child in a small transparent guise.
 */

/**
 * Creates one normalized modeling object.
 * @param {object} keserInput Object source data.
 * @param {number} [malchusIndex] Fallback stable ordinal.
 * @returns {object} Canonical object data.
 */
export function createModelingObject(keserInput = {}, malchusIndex = 1) {
	const yesodId = String(keserInput.id || `model_${malchusIndex}`);
	return {
		id: yesodId,
		name: String(keserInput.name || yesodId),
		primitive: keserInput.primitive ? {...keserInput.primitive} : null,
		geometry: keserInput.geometry ? {...keserInput.geometry} : null,
		transform: {
			position: [...(keserInput.transform?.position || [0, 0, 0])],
			rotation: [...(keserInput.transform?.rotation || [0, 0, 0])],
			scale: [...(keserInput.transform?.scale || [1, 1, 1])]
		},
		material: keserInput.material || null,
		operations: [...(keserInput.operations || [])],
		children: [...(keserInput.children || [])],
		tags: [...(keserInput.tags || [])],
		quality: {...(keserInput.quality || {})},
		metadata: {...(keserInput.metadata || {})}
	};
}
