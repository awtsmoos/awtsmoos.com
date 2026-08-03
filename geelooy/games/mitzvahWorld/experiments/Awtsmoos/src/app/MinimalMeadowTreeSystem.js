// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowTreeSystem.js
 * @description Mounts one ecology-aware procedural forest with rooted, species-specific wind.
 * The Awtsmoos reveals trunk, crown, role, and breeze before optional networks answer;
 * Awtsmoos.com keeps shared geometry, one scene group, zero frame allocations, and truthful counts.
 */

import { Group } from '../../../light-three-gltf/tiny-runtime.js';
import { createMinimalMeadowTree } from './MinimalMeadowTreeFactory.js';
import { createMinimalMeadowTreeMaterials } from './MinimalMeadowTreeMaterialSources.js';
import { createMinimalMeadowTreePlacements } from './MinimalMeadowTreePlacements.js';
import { animateMinimalMeadowTree } from './MinimalMeadowTreeWind.js';
import { minimalMeadowTreeDiagnostics } from './MinimalMeadowWorldPopulationDiagnostics.js';
import { beginMinimalMeadowTreeHydration } from './MinimalMeadowWorldPopulationHydration.js';

export class MinimalMeadowTreeSystem {
	static async create(runtime) {
		if (runtime.trees?.group) return runtime.trees;
		const system = new MinimalMeadowTreeSystem(runtime);
		if (runtime.environment?.disablePublicAssets !== true) {
			beginMinimalMeadowTreeHydration(system);
		}
		return system;
	}

	constructor(runtime) {
		this.runtime = runtime;
		this.group = new Group();
		this.group.name = 'Awtsmoos_canonical_procedural_ecology_forest';
		this.mobile = mobileProfile(runtime);
		this.records = [];
		this.hydrationState = 'procedural-visible';
		this.materials = createMinimalMeadowTreeMaterials([], runtime.environment?.document);
		this.placements = createMinimalMeadowTreePlacements(runtime.terrain, {
			mobile: this.mobile
		});
		this.errors = [];
		this.trees = this.placements.flatMap(placement => this.createTree(placement));
		for (const tree of this.trees) this.group.add(tree);
		this.clock = 0;
	}

	createTree(placement) {
		try {
			const tree = createMinimalMeadowTree(placement, this.materials);
			tree.userData ||= {};
			tree.userData.AwtsmoosTreeEcology = Object.freeze({
				canopyDensity: placement.canopyDensity,
				ecologyZone: placement.ecologyZone,
				preset: placement.preset,
				role: placement.role,
				windPhase: placement.windPhase,
				windSpeed: placement.windSpeed,
				windStrength: placement.windStrength
			});
			return [tree];
		} catch (error) {
			this.errors.push({ id: placement.id, message: error.message });
			return [];
		}
	}

	update(deltaSeconds) {
		this.clock += deltaSeconds;
		for (let index = 0; index < this.trees.length; index += 1) {
			animateMinimalMeadowTree(
				this.trees[index],
				this.clock,
				index,
				this.runtime.state
			);
		}
	}

	diagnostics() {
		return minimalMeadowTreeDiagnostics(this);
	}

	destroy() {
		this.group.parent?.remove(this.group);
		if (this.runtime.trees === this) this.runtime.trees = null;
	}
}

function mobileProfile(runtime) {
	const environment = runtime.environment || globalThis;
	return Number(environment.innerWidth || 1024) <= 820
		|| Boolean(environment.matchMedia?.('(pointer: coarse)')?.matches);
}
