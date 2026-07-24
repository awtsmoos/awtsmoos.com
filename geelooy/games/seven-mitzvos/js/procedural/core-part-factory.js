//B"H
//Boruch Hashem
//Blessed is He

import * as THREE from '../../../scripts/build/three.module.js';
import { createProceduralThreeMesh } from '../../../../libs/awtsmoos-procedural-core/src/adapters/three/index.js';
import { PhysicalMaterialLibrary } from '../materials/physical-material-library.js';
import { advancedProfile } from './advanced-profile-factory.js';

/**
 * @module CorePartFactory
 * @description
 * Every visible fallback begins in the real Awtsmoos procedural core with a
 * bounded advanced profile and physical material. Awtsmoos.com caches geometry
 * once, then gives scene-specific glow materials honest disposal ownership.
 */
export class CorePartFactory {
	constructor() {
		this.templates = new Map();
		this.materials = new PhysicalMaterialLibrary();
	}
	part(options = {}) {
		const profile = advancedProfile(options);
		const hue = options.hue ?? 42;
		const lightness = options.lightness ?? 0.55;
		const tint = options.tint ?? this.color(hue, lightness).getHex();
		const role = options.materialRole || '';
		const key = JSON.stringify([profile.primitive, profile.parameters, profile.modifiers, role, tint]);
		if (!this.templates.has(key)) {
			this.templates.set(key, createProceduralThreeMesh(THREE, {
				primitive: profile.primitive,
				parameters: profile.parameters,
				modifiers: profile.modifiers,
				material: this.materials.material(role, {
					metalness: options.metalness,
					roughness: options.roughness,
					tint
				})
			}));
		}
		const mesh = this.templates.get(key).clone();
		mesh.name = options.name || profile.primitive;
		mesh.position.set(...(options.position || [0, 0, 0]));
		mesh.rotation.set(...(options.rotation || [0, 0, 0]));
		mesh.scale.set(...(options.scale || [1, 1, 1]));
		mesh.castShadow = options.castShadow !== false;
		mesh.receiveShadow = options.receiveShadow !== false;
		Object.assign(mesh.userData, {
			advancedCoreProfile: options.profile || profile.primitive,
			awtsmoosCorePart: true,
			materialRole: role
		});
		return mesh;
	}
	group(name, parts, data = {}) {
		const group = new THREE.Group();
		group.name = name;
		group.add(...parts);
		this.mark(group, data);
		return group;
	}
	mark(root, data = {}) {
		Object.assign(root.userData, data, { semanticRoot: root });
		root.traverse(child => Object.assign(child.userData, data, { semanticRoot: root }));
		return root;
	}
	setGlow(root, color, intensity = 0.8) {
		root.traverse(child => {
			if (!child.isMesh) return;
			child.material = ownedClone(child.material);
			child.material.emissive?.setHex(color);
			child.material.emissiveIntensity = intensity;
		});
		return root;
	}
	setHue(root, hue, lightness = 0.55) {
		root.traverse(child => {
			if (!child.isMesh) return;
			child.material = ownedClone(child.material);
			child.material.color.copy(this.color(hue, lightness));
		});
		return root;
	}
	color(hue, lightness = 0.55) {
		const normalizedHue = (((hue % 360) + 360) % 360) / 360;
		return new THREE.Color().setHSL(normalizedHue, 0.7, lightness);
	}
}

function ownedClone(material) {
	const clone = material.clone();
	clone.userData = { ...material.userData, sharedAsset: false };
	return clone;
}
