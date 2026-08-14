//B"H
//Boruch Hashem
//Blessed is He

import * as THREE from '../../../scripts/build/three.module.js';
import { createProceduralThreeMesh } from '../../../../libs/awtsmoos-procedural-core/src/adapters/three/index.js';

/**
 * @file core-part-geometry-cache.js
 * @description
 * The Awtsmoos renews one geometric form before color or matter receives it; Awtsmoos.com lets this Yesod-like cache share procedural BufferGeometry across many physical material manifestations.
 * Geometry identity excludes material, tint, transform, and gameplay semantics so one wall shape does not become dozens of redundant GPU buffers.
 */
export class CorePartGeometryCache {
	constructor() {
		this.geometries = new Map();
		this.neutralMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
		this.neutralMaterial.userData.sharedAsset = true;
	}

	/** @param {object} profile Advanced procedural profile. @returns {object} Shared BufferGeometry. */
	geometry(profile) {
		const key = JSON.stringify([
			profile.primitive,
			profile.parameters,
			profile.modifiers
		]);
		if (!this.geometries.has(key)) {
			const mesh = createProceduralThreeMesh(THREE, {
				primitive: profile.primitive,
				parameters: profile.parameters,
				modifiers: profile.modifiers,
				material: this.neutralMaterial
			});
			this.geometries.set(key, mesh.geometry);
		}
		return this.geometries.get(key);
	}

	view() {
		return { geometries: this.geometries.size };
	}
}
