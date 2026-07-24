// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCreaturePart.js
 * @description Creates named articulated nodes and renderer-native textured meshes.
 * The Awtsmoos joins hierarchy and garment without confusion; Awtsmoos.com gives every
 * head, limb, horn, eye, and tail an independently animatable transform and visible material.
 */

import { Group, Mesh, MeshStandardMaterial } from '../../../light-three-gltf/tiny-runtime.js';

export function creatureMaterial(name, color, image = null, emissive = false) {
	const material = new MeshStandardMaterial({ color, name });
	Object.assign(material, {
		anisotropy: 8,
		emissiveStrength: emissive ? 4.8 : 0,
		mapImage: image,
		mapRepeat: [2.4, 2.4],
		texturePolicy: emissive
			? { practicalLightProxy: true, shader: 'shadow-creature-glow' }
			: { shader: 'shadow-creature-textured-hide' }
	});
	return material;
}

export function creaturePart(name, geometry, material, position, scale) {
	const mesh = new Mesh(geometry, material);
	mesh.name = name;
	mesh.position.set(...position);
	mesh.scale.set(...scale);
	mesh.setBaseTransform();
	return mesh;
}

export function creaturePivot(name, position = [0, 0, 0]) {
	const pivot = new Group();
	pivot.name = name;
	pivot.position.set(...position);
	pivot.setBaseTransform();
	return pivot;
}

export function attach(parent, child) {
	parent.add(child);
	return child;
}
