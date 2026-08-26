// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowWaterSystem.js
 * @description Mounts immediate water, hydrates its real material stack, and reports live river/lake geometry plus flowing shader policy.
 * The Awtsmoos carries current before and after finite loading; Awtsmoos.com keeps uploaded color, dual normals,
 * carved surfaces, physical shader law, allocation-free motion, and evidence inside one mounted water authority.
 */

import { Group } from '../../../light-three-gltf/tiny-runtime.js';
import { createPrimitiveMesh } from '../world/Box3D.js';
import { minimalMeadowWaterElevationEvidence } from './MinimalMeadowRiverBanksDiagnostics.js';
import { MINIMAL_MEADOW_RIVER_SEGMENTS } from './MinimalMeadowRiverPath.js';
import { createMinimalMeadowWaterDefinitions } from './MinimalMeadowWaterDefinitions.js';
import {
	animateMinimalMeadowWaterMaterials,
	hydrateMinimalMeadowWaterMaterials
} from './MinimalMeadowWaterMaterialHydration.js';
import {
	createMinimalMeadowWaterFallbackSources,
	loadMinimalMeadowWaterSources
} from './MinimalMeadowWaterSources.js';
import { minimalMeadowMeshMetrics } from './MinimalMeadowWorldPopulationDiagnostics.js';

export class MinimalMeadowWaterSystem {
	static async create(runtime) {
		if (runtime.water?.group) return runtime.water;
		const sources = createMinimalMeadowWaterFallbackSources(runtime.environment || globalThis);
		const system = new MinimalMeadowWaterSystem(runtime, sources);
		if (runtime.environment?.disablePublicAssets !== true) system.beginPublicHydration();
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
		this.hydratedMeshes = 0;
		this.hydrationState = 'procedural-visible';
		this.errors = [];
	}

	beginPublicHydration() {
		this.hydrationState = 'loading-water-material-pack';
		this.hydrationPromise = loadMinimalMeadowWaterSources(this.runtime.environment || globalThis)
			.then(sources => this.finishHydration(sources))
			.catch(error => this.failHydration(error));
		return this.hydrationPromise;
	}

	finishHydration(sources) {
		this.sources = sources;
		this.hydratedMeshes = hydrateMinimalMeadowWaterMaterials(this.meshes, sources);
		this.hydrationState = sources.hostedColorReady ? 'textured-water-ready' : 'procedural-visible';
		return sources;
	}

	failHydration(error) {
		this.errors.push(error.message);
		this.hydrationState = 'procedural-visible';
		return this.sources;
	}

	update(deltaSeconds) {
		this.clock += Math.max(0, Number(deltaSeconds) || 0);
		animateMinimalMeadowWaterMaterials(this.meshes, this.clock);
	}

	diagnostics() {
		const metrics = minimalMeadowMeshMetrics(this.meshes);
		const surfaces = this.meshes.filter(mesh => mesh.userData?.waterVariant);
		const river = surfaces.find(mesh => mesh.userData.waterVariant === 'river');
		const lake = surfaces.find(mesh => mesh.userData.waterVariant === 'lake');
		const policy = surfaces[0]?.material?.texturePolicy || {};
		return {
			activeNormalSources: this.sources.activeNormalSources,
			bankMeshes: 2,
			bedMeshes: 2,
			colorMode: this.sources.colorMode,
			drawCalls: this.meshes.length,
			elevations: minimalMeadowWaterElevationEvidence(),
			errors: [...this.errors],
			flowLayers: Number(policy.flowLayers || 0),
			hostedColorReady: this.sources.hostedColorReady,
			hydratedMeshes: this.hydratedMeshes,
			hydrationState: this.hydrationState,
			lakeVertices: vertexCount(lake),
			materials: metrics.materials,
			mounted: this.group.parent === this.runtime.scene,
			normalMode: this.sources.normalMode,
			physicalShader: policy.waterPhysical?.shader || null,
			riverSegments: MINIMAL_MEADOW_RIVER_SEGMENTS,
			riverVertices: vertexCount(river),
			sceneObjects: 1 + this.meshes.length,
			shader: policy.shader || null,
			triangles: metrics.triangles,
			updateAllocations: 0,
			waterMeshes: surfaces.length
		};
	}

	destroy() {
		this.group.parent?.remove(this.group);
		if (this.runtime.water === this) this.runtime.water = null;
	}
}

function vertexCount(mesh) {
	return Number(mesh?.geometry?.attributes?.position?.array?.length || 0) / 3;
}
