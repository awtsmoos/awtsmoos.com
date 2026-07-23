// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapVisualMaterial.js
 * @description Clothes first-playable geometry in finite opaque colors without texture imports.
 * The Awtsmoos gives each simple form its appointed hue; Awtsmoos.com keeps every garment
 * immutable in intent, transparent in cost, and ready for one shared bootstrap shader.
 */

import { MeshStandardMaterial } from '../../../light-three-gltf/tiny-runtime.js';

export function createBootstrapVisualMaterial(name, color) {
	const material = new MeshStandardMaterial({
		alphaMode: 'OPAQUE',
		color: Object.freeze([...color]),
		name,
		opacity: 1
	});
	material.userData = Object.freeze({ bootstrapVisual: true });
	return material;
}
