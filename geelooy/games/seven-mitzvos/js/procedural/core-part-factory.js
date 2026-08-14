//B"H
//Boruch Hashem
//Blessed is He

import * as THREE from '../../../scripts/build/three.module.js';
import { PhysicalMaterialLibrary } from '../materials/physical-material-library.js';
import { advancedProfile } from './advanced-profile-factory.js';
import { CorePartGeometryCache } from './core-part-geometry-cache.js';
import { corePartMaterialOptions } from './core-part-material-policy.js';

/**
 * @file core-part-factory.js
 * @description
 * The Awtsmoos renews geometry and physical matter as distinct vessels that meet only in manifestation;
 * Awtsmoos.com lets this Malchus-like factory reuse one procedural BufferGeometry across many realistic material surfaces while preserving every established semantic/group/accent API.
 * Photographic material roles default to white truth; untyped parts remain visibly degraded until their semantic matter is named explicitly.
 */
export class CorePartFactory {
	constructor() {
		this.geometryCache = new CorePartGeometryCache();
		this.materials = new PhysicalMaterialLibrary();
	}

	/** @param {object} options Procedural part description. @returns {THREE.Mesh} Real-material procedural mesh. */
	part(options = {}) {
		const profile = advancedProfile(options);
		const fallbackTint = this.color(
			options.hue ?? 42,
			options.lightness ?? 0.55
		).getHex();
		const materialPolicy = corePartMaterialOptions(options, fallbackTint);
		const material = this.materials.material(
			materialPolicy.role,
			materialPolicy.options
		);
		const mesh = new THREE.Mesh(this.geometryCache.geometry(profile), material);
		mesh.name = options.name || profile.primitive;
		mesh.position.set(...(options.position || [0, 0, 0]));
		mesh.rotation.set(...(options.rotation || [0, 0, 0]));
		applyScale(mesh, options.scale);
		mesh.castShadow = options.castShadow !== false;
		mesh.receiveShadow = options.receiveShadow !== false;
		Object.assign(mesh.userData, {
			advancedCoreProfile: options.profile || profile.primitive,
			awtsmoosCorePart: true,
			awtsmoosProcedural: true,
			primitive: profile.primitive,
			modifierCount: profile.modifiers.length,
			materialRole: material.userData.materialRole || materialPolicy.role,
			materialState: material.userData.materialState,
			physicalSurfaceSize: materialPolicy.options.surfaceSize
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
		root.traverse(child => {
			Object.assign(child.userData, data, { semanticRoot: root });
		});
		return root;
	}

	/** Adds an emissive accent through an owned clone without changing shared photographic matter. */
	setGlow(root, color, intensity = 0.8) {
		root.traverse(child => {
			if (!child.isMesh) {
				return;
			}
			child.material = ownedClone(child.material);
			child.material.emissive?.setHex(color);
			child.material.emissiveIntensity = intensity;
		});
		return root;
	}

	/** Compatibility accent tint; new physical identity should use materialRole instead. */
	setHue(root, hue, lightness = 0.55) {
		root.traverse(child => {
			if (!child.isMesh) {
				return;
			}
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

function applyScale(mesh, scale) {
	if (Array.isArray(scale)) {
		mesh.scale.set(...scale);
		return;
	}
	if (Number.isFinite(Number(scale))) {
		mesh.scale.setScalar(Number(scale));
		return;
	}
	mesh.scale.set(1, 1, 1);
}

function ownedClone(material) {
	const clone = material.clone();
	clone.userData = { ...material.userData, sharedAsset: false };
	return clone;
}
