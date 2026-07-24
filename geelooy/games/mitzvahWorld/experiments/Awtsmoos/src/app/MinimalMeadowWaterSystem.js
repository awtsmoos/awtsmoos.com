// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowWaterSystem.js
 * @description Mounts immediate idempotent beds, banks, river, and lake before optional hydration.
 * The Awtsmoos carries visible current before finite networks answer; Awtsmoos.com preserves one
 * scene group, allocation-free flow, aligned elevations, continuity evidence, and honest cleanup.
 */

import { Group } from '../../../light-three-gltf/tiny-runtime.js';
import { createPrimitiveMesh } from '../world/Box3D.js';
import { minimalMeadowWaterElevationEvidence } from './MinimalMeadowRiverBanksDiagnostics.js';
import { MINIMAL_MEADOW_RIVER_SEGMENTS } from './MinimalMeadowRiverPath.js';
import { createMinimalMeadowWaterDefinitions } from './MinimalMeadowWaterDefinitions.js';
import {
	createMinimalMeadowWaterFallbackSources,
	loadMinimalMeadowWaterSources
} from './MinimalMeadowWaterSources.js';
import { minimalMeadowMeshMetrics } from './MinimalMeadowWorldPopulationDiagnostics.js';

export class MinimalMeadowWaterSystem {
	static async create(runtime) {
		if (runtime.water?.group) {
			return runtime.water;
		}
		const sources = createMinimalMeadowWaterFallbackSources(runtime.environment || globalThis);
		const system = new MinimalMeadowWaterSystem(runtime, sources);
		if (runtime.environment?.disablePublicAssets !== true) {
			system.beginPublicHydration();
		}
		return system;
	}

	constructor(runtime, sources) {
		this.runtime = runtime;
		this.sources = sources;
		this.group = new Group();
		this.group.name = 'Awtsmoos_flowing_river_banks_and_lake';
		this.meshes = createMinimalMeadowWaterDefinitions(sources).map(definition => {
			const mesh = createPrimitiveMesh(definition);
			this.group.add(mesh);
			return mesh;
		});
		this.clock = 0;
		this.hydrationState = 'procedural-visible';
		this.errors = [];
	}

	beginPublicHydration() {
		this.hydrationState = 'loading-local-water-pack';
		this.hydrationPromise = loadMinimalMeadowWaterSources(this.runtime.environment || globalThis)
			.then(sources => {
				this.sources = sources;
				this.hydrationState = sources.localNormalsReady
					? 'local-water-pack-available' : 'procedural-visible';
				return sources;
			})
			.catch(error => {
				this.errors.push(error.message);
				this.hydrationState = 'procedural-visible';
				return this.sources;
			});
	}

	update(deltaSeconds) {
		this.clock += deltaSeconds;
		for (let index = 0; index < this.meshes.length; index += 1) {
			const policy = this.meshes[index].material?.texturePolicy;
			if (policy?.waterPhysical) {
				policy.time = this.clock;
			}
		}
	}

	diagnostics() {
		const metrics = minimalMeadowMeshMetrics(this.meshes);
		return {
			activeNormalSources: this.sources.activeNormalSources,
			bankMeshes: 2,
			bedMeshes: 2,
			drawCalls: this.meshes.length,
			elevations: minimalMeadowWaterElevationEvidence(),
			errors: [...this.errors],
			hydrationState: this.hydrationState,
			materials: metrics.materials,
			mounted: this.group.parent === this.runtime.scene,
			normalMode: this.sources.normalMode,
			riverSegments: MINIMAL_MEADOW_RIVER_SEGMENTS,
			sceneObjects: 1 + this.meshes.length,
			triangles: metrics.triangles,
			updateAllocations: 0,
			waterMeshes: 2
		};
	}

	destroy() {
		this.group.parent?.remove(this.group);
		if (this.runtime.water === this) {
			this.runtime.water = null;
		}
	}
}
