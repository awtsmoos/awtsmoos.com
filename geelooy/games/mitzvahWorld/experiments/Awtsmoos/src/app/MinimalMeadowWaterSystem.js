// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowWaterSystem.js
 * @description Mounts canonical river/lake presentation, hydrates materials, and applies adaptive allocation-free motion.
 * The Awtsmoos carries one current through changing vessels; Awtsmoos.com keeps water alive, measured, and clear,
 * so richer shimmer answers available frame-time without multiplying geometry, draw calls, or hidden fear.
 */

import { Group } from '../../../light-three-gltf/tiny-runtime.js';
import { createPrimitiveMesh } from '../world/Box3D.js';
import {
	animateMinimalMeadowWaterMaterials,
	prepareMinimalMeadowWaterAnimation
} from './MinimalMeadowWaterAnimation.js';
import { minimalMeadowWaterDiagnostics } from './MinimalMeadowWaterDiagnostics.js';
import { createMinimalMeadowWaterDefinitions } from './MinimalMeadowWaterDefinitions.js';
import { hydrateMinimalMeadowWaterMaterials } from './MinimalMeadowWaterMaterialHydration.js';
import { minimalMeadowWaterQualityFor } from './MinimalMeadowWaterQualityPolicy.js';
import {
	createMinimalMeadowWaterFallbackSources,
	loadMinimalMeadowWaterSources
} from './MinimalMeadowWaterSources.js';

export class MinimalMeadowWaterSystem {
	/**
	 * @description Reuses an existing water authority or creates the canonical minimal-meadow instance.
	 * @param {object} runtime Active minimal-meadow runtime.
	 * @returns {Promise<MinimalMeadowWaterSystem>} Mounted-ready water authority.
	 */
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

	/**
	 * @description Builds the six bounded water-family meshes and prepares stable animation buffers before gameplay updates.
	 * @param {object} runtime Active runtime.
	 * @param {object} sources Immediate fallback water sources.
	 */
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
		this.frameIndex = 0;
		this.animatedSurfaces = 0;
		this.preparedSurfaces = prepareMinimalMeadowWaterAnimation(this.meshes);
		this.qualityPolicy = minimalMeadowWaterQualityFor(runtime);
		this.hydratedMeshes = 0;
		this.hydrationState = 'procedural-visible';
		this.errors = [];
	}

	/** @description Begins non-blocking public material hydration. @returns {Promise<object>} Hydration promise. */
	beginPublicHydration() {
		this.hydrationState = 'loading-water-material-pack';
		this.hydrationPromise = loadMinimalMeadowWaterSources(this.runtime.environment || globalThis)
			.then(sources => this.finishHydration(sources))
			.catch(error => this.failHydration(error));
		return this.hydrationPromise;
	}

	/** @description Applies loaded water sources in place. @param {object} sources Hydrated source set. @returns {object} Applied source set. */
	finishHydration(sources) {
		this.sources = sources;
		this.hydratedMeshes = hydrateMinimalMeadowWaterMaterials(this.meshes, sources);
		this.hydrationState = sources.hostedColorReady ? 'textured-water-ready' : 'procedural-visible';
		return sources;
	}

	/** @description Preserves playable fallback water when public hydration fails. @param {Error} error Hydration failure. @returns {object} Existing fallback sources. */
	failHydration(error) {
		this.errors.push(error.message);
		this.hydrationState = 'procedural-visible';
		return this.sources;
	}

	/** @description Advances adaptive water motion while keeping steady-state update allocations at zero. @param {number} deltaSeconds Frame delta in seconds. @returns {void} */
	update(deltaSeconds) {
		this.clock += Math.max(0, Number(deltaSeconds) || 0);
		this.frameIndex += 1;
		this.qualityPolicy = minimalMeadowWaterQualityFor(this.runtime);
		this.animatedSurfaces = animateMinimalMeadowWaterMaterials(
			this.meshes,
			this.clock,
			this.qualityPolicy,
			this.frameIndex
		);
	}

	/** @description Returns on-demand evidence without adding work to the frame loop. @returns {object} Water diagnostic receipt. */
	diagnostics() {
		return minimalMeadowWaterDiagnostics(this);
	}

	/** @description Detaches the water group and clears canonical runtime ownership. @returns {void} */
	destroy() {
		this.group.parent?.remove(this.group);
		if (this.runtime.water === this) {
			this.runtime.water = null;
		}
	}
}
