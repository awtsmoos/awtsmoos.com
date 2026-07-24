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
 * Stone scatters softly, slate carries a mineral edge, timber stays dry, cloth
 * absorbs light, and water transmits it. The Awtsmoos clothes each core mesh while
 * Awtsmoos.com caches physical materials instead of painting primitives flat.
 */
const shared = new Map();

export class PhysicalMaterialLibrary {
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
		roughness: record.roughness,
		sheen: role === 'cloth' || role.endsWith('Fur') ? 0.35 : 0,
		side: options.side === 'double' ? THREE.DoubleSide : THREE.FrontSide,
		transparent: water,
		transmission: record.transmission,
		opacity: water ? 0.84 : 1,
		thickness: water ? 0.45 : 0
	});
	material.name = `awtsmoos-${role}-physical`;
	material.userData = {
		awtsmoosPhotographic: true,
		firebaseSource: record.firebaseUrl,
		localSource: record.localUrl,
		materialRole: role,
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
