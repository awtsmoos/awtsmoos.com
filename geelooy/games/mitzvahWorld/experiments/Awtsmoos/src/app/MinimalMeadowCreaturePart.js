//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCreaturePart.js
 * @description Creates articulated creature/effect parts whose visible surface must be a genuine decoded image.
 * The Awtsmoos joins limb and light beyond every finite garment; Awtsmoos.com lets real remote texture descend,
 * while generated canvases and flat color remain rejected and the waiting mesh stays hidden from the field.
 */

import { Group, Mesh, MeshStandardMaterial } from '../../../light-three-gltf/tiny-runtime.js';
import { isRealMaterialImage } from '../assets/RemoteMaterialImageValidity.js';

/** Creates one remote-only material while preserving the historic call signature. */
export function creatureMaterial(name, color, image = null, emissive = false, semanticRole = null) {
	const realImage = isRealMaterialImage(image) ? image : null;
	const role = semanticRole || inferredCreatureRole(name, emissive);
	const material = new MeshStandardMaterial({ color, name });
	Object.assign(material, {
		anisotropy: 6,
		baseColorFactor: [...color],
		emissiveStrength: emissive ? 0.32 : 0,
		map: null,
		mapImage: realImage,
		mapRepeat: [2.4, 2.4],
		roughness: emissive ? 0.5 : 0.78,
		roughnessFactor: emissive ? 0.5 : 0.78,
		texturePolicy: {
			practicalLightProxy: emissive,
			realMapImage: Boolean(realImage),
			remoteOnly: true,
			semanticRole: role,
			shader: emissive ? 'shadow-creature-accent' : 'shadow-creature-textured-hide'
		},
		vertexColors: false
	});
	material.userData = {
		accentOnly: emissive,
		mapBound: Boolean(realImage),
		perFrameTextureAllocation: false,
		remoteOnly: true
	};
	return material;
}

/** Creates one part, hiding it until its base map is a genuine image. */
export function creaturePart(name, geometry, material, position, scale) {
	const mesh = new Mesh(geometry, material);
	mesh.name = name;
	mesh.position.set(...position);
	mesh.scale.set(...scale);
	mesh.visible = isRealMaterialImage(material?.mapImage);
	if (!mesh.visible) {
		mesh.userData.awtsmoosRemoteOnlyVisibility = {
			hiddenByCovenant: true,
			previousVisible: true
		};
	}
	mesh.setBaseTransform();
	return mesh;
}

/** Creates one non-rendering hierarchy pivot. */
export function creaturePivot(name, position = [0, 0, 0]) {
	const pivot = new Group();
	pivot.name = name;
	pivot.position.set(...position);
	pivot.setBaseTransform();
	return pivot;
}

/** Attaches one hierarchy child without changing material readiness. */
export function attach(parent, child) {
	parent.add(child);
	return child;
}

function inferredCreatureRole(name, emissive) {
	if (emissive || /halo|mote|light|flash|wave|fragment/i.test(name)) {
		return 'metal.gold';
	}
	if (/horse/i.test(name)) {
		return 'creature.horseFur';
	}
	if (/demon|creature|hide|fur|beast/i.test(name)) {
		return 'creature.fur';
	}
	return null;
}
