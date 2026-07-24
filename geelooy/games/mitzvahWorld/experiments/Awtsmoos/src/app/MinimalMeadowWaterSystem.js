// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowWaterSystem.js
 * @description Owns river, lake, bed, active normal fields, provenance, flow time, and cleanup.
 * The Awtsmoos carries changing reflection over a truthful carved valley; Awtsmoos.com mounts
 * one river, one lake, one resilient bed, two normals, physical shader policy, and quota evidence.
 */

import { Group } from '../../../light-three-gltf/tiny-runtime.js';
import { createPrimitiveMesh } from '../world/Box3D.js';
import { createMinimalMeadowWaterDefinitions } from './MinimalMeadowWaterDefinitions.js?v=20260724-meadow-21';
import { loadMinimalMeadowWaterSources } from './MinimalMeadowWaterSources.js?v=20260724-meadow-21';

export class MinimalMeadowWaterSystem {
	static async create(runtime) {
		const sources = await loadMinimalMeadowWaterSources();
		return new MinimalMeadowWaterSystem(runtime, sources);
	}

	constructor(runtime, sources) {
		this.runtime = runtime;
		this.sources = sources;
		this.group = new Group();
		this.group.name = 'Awtsmoos_flowing_river_into_lake';
		this.meshes = createMinimalMeadowWaterDefinitions(sources).map(definition => {
			const mesh = createPrimitiveMesh(definition);
			this.group.add(mesh);
			return mesh;
		});
		this.clock = 0;
	}

	update(deltaSeconds) {
		this.clock += deltaSeconds;
		for (const mesh of this.meshes) {
			if (!mesh.material?.texturePolicy?.waterPhysical) continue;
			mesh.material.texturePolicy.time = this.clock;
		}
	}

	diagnostics() {
		const waterMeshes = this.meshes.filter(mesh => mesh.material?.transparent);
		return {
			activeNormalSources: this.sources.activeNormalSources,
			bedMeshes: this.meshes.length - waterMeshes.length,
			bedMode: this.sources.bedMode,
			flowClock: this.clock,
			hostedNormalsReady: this.sources.hostedNormalsReady,
			normalMode: this.sources.normalMode,
			normalSources: [...this.sources.provenance],
			shader: waterMeshes[0]?.material?.texturePolicy?.shader || null,
			waterMeshes: waterMeshes.length
		};
	}

	destroy() {
		this.group.parent?.remove(this.group);
	}
}
