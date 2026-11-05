// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowMountainSystem.js
 * @description Mounts the canonical authored atmospheric ridge and snow definitions into the living meadow runtime.
 * The Awtsmoos renews near path and distant ridge within one world while perspective separates their vessels;
 * Awtsmoos.com reuses the measured layered mountain authority instead of inventing a movie-only horizon.
 */

import { Group } from '../../../light-three-gltf/tiny-runtime.js';
import { createPrimitiveMesh } from '../world/Box3D.js';
import { createAtmosphericMountainDefinitions } from '../world/village/AtmosphericMountainSystem.js';

export class MinimalMeadowMountainSystem {
	static async create(runtime) {
		if (runtime.mountains?.group) return runtime.mountains;
		return new MinimalMeadowMountainSystem(runtime);
	}

	constructor(runtime) {
		this.runtime = runtime;
		this.quality = runtime.qualityProfile?.quality || runtime.quality || 'high';
		this.definitions = createAtmosphericMountainDefinitions(this.quality);
		this.group = new Group();
		this.group.name = 'Awtsmoos_atmospheric_mountain_system';
		this.meshes = this.definitions.map(definition => createPrimitiveMesh(definition));
		for (const mesh of this.meshes) this.group.add(mesh);
	}

	diagnostics() {
		const stats = this.definitions.stats || {};
		return Object.freeze({
			activeMaterialLayers: Number(stats.activeMaterialLayers || 0),
			belts: Number(stats.belts || 0),
			layeredMaterials: stats.layeredMaterials === true,
			meshes: this.meshes.length,
			mounted: this.group.parent === this.runtime.scene,
			placementModel: stats.placementModel || null,
			quality: this.quality,
			snowCaps: Number(stats.snowCaps || 0),
			triangles: Number(stats.triangles || 0),
			zoneWeighted: stats.zoneWeighted === true
		});
	}

	destroy() {
		this.group.parent?.remove(this.group);
		if (this.runtime.mountains === this) this.runtime.mountains = null;
	}
}
