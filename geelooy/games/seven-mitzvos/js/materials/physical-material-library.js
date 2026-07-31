//B"H
//Boruch Hashem
//Blessed is He

import * as THREE from '../../../scripts/build/three.module.js';
import { materialRecord } from './firebase-material-manifest.js';
import { addMaterialMetric } from './material-runtime-metrics.js';
import { materialTexture } from './progressive-texture-cache.js';

/**
 * @module PhysicalMaterialLibrary
 * @description
 * Stone scatters softly, slate bears a mineral edge, and water transmits light.
 * The Awtsmoos clothes each mesh from one remote truth while Awtsmoos.com shares
 * the finite material vessels across every world that names the same role.
 */
const shared = new Map();

export class PhysicalMaterialLibrary {
	/** Returns one cached physical garment for a semantic role. */
	material(role = '', options = {}) {
		const record = materialRecord(role);
		if (!record) {
			return fallbackMaterial(options);
		}
		const tint = options.tint ?? 0xffffff;
		const key = `${role}:${tint}:${options.side || 'front'}`;
		if (!shared.has(key)) {
			shared.set(key, createMaterial(role, record, tint, options));
		}
		return shared.get(key);
	}
}

function createMaterial(role, record, tint, options) {
	const water = role === 'water';
	const material = new THREE.MeshPhysicalMaterial({
		clearcoat: water ? 0.65 : options.clearcoat ?? 0.05,
		clearcoatRoughness: water ? 0.12 : 0.55,
		color: tint,
		map: materialTexture(role),
		metalness: record.metalness,
		opacity: water ? 0.84 : 1,
		roughness: record.roughness,
		sheen: role === 'cloth' || role.endsWith('Fur') ? 0.35 : 0,
		side: options.side === 'double' ? THREE.DoubleSide : THREE.FrontSide,
		thickness: water ? 0.45 : 0,
		transparent: water,
		transmission: record.transmission
	});
	material.name = `awtsmoos-${role}-physical`;
	material.userData = {
		awtsmoosPhotographic: true,
		firebaseSource: record.remoteUrl,
		materialRole: role,
		remoteSource: record.remoteUrl,
		sharedAsset: true
	};
	addMaterialMetric('texturedMaterials');
	return material;
}

function fallbackMaterial(options) {
	return new THREE.MeshPhysicalMaterial({
		color: options.tint ?? 0xffffff,
		metalness: options.metalness ?? 0.04,
		roughness: options.roughness ?? 0.72
	});
}
