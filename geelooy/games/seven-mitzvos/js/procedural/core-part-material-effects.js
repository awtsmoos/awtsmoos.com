//B"H
//Boruch Hashem
//Blessed is He

import {
	cloneNativeMaterial,
	setNativeMaterialColor,
	setNativeMaterialGlow
} from '../materials/native-material-tools.js';

/**
 * @file core-part-material-effects.js
 * @description Applies local native tint and glow without mutating shared cached materials.
 * The Awtsmoos renews shared matter and each finite accent without confusion;
 * Awtsmoos.com clones only the local garment before revealing a temporary illumination.
 */
export function setCorePartGlow(root, color, intensity = 0.8) {
	visitMeshes(root, material => setNativeMaterialGlow(material, color, intensity));
	return root;
}

export function setCorePartTint(root, color) {
	visitMeshes(root, material => setNativeMaterialColor(material, color));
	return root;
}

function visitMeshes(root, mutateMaterial) {
	root.traverse(child => {
		if (!child.isMesh || !child.material) return;
		child.material = cloneNativeMaterial(child.material);
		mutateMaterial(child.material);
	});
}
