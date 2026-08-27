// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowTreeSystem.js
 * @description Mounts an immediate idempotent forest and reports only its actual scene children.
 * The Awtsmoos reveals trunk and canopy before optional networks answer; Awtsmoos.com keeps one
 * scene group, moves no geometry per frame, and exposes every live count instead of silent intent.
 */

import { Group } from '../../../light-three-gltf/tiny-runtime.js';
import { createMinimalMeadowTree } from './MinimalMeadowTreeFactory.js';
import { createMinimalMeadowTreeMaterials } from './MinimalMeadowTreeMaterialSources.js';
import { createMinimalMeadowTreePlacements } from './MinimalMeadowTreePlacements.js';
import { minimalMeadowTreeDiagnostics } from './MinimalMeadowWorldPopulationDiagnostics.js';
import { beginMinimalMeadowTreeHydration } from './MinimalMeadowWorldPopulationHydration.js';

export class MinimalMeadowTreeSystem {
	static async create(runtime) {
		if (runtime.trees?.group) {
			return runtime.trees;
		}
		const system = new MinimalMeadowTreeSystem(runtime);
		if (runtime.environment?.disablePublicAssets !== true) {
			beginMinimalMeadowTreeHydration(system);
		}
		return system;
	}

	constructor(runtime) {
		this.runtime = runtime;
		this.group = new Group();
		this.group.name = 'Awtsmoos_canonical_procedural_core_forest';
		this.mobile = mobileProfile(runtime);
		this.records = [];
		this.hydrationState = 'procedural-visible';
		this.materials = createMinimalMeadowTreeMaterials([], runtime.environment?.document);
		this.placements = createMinimalMeadowTreePlacements(runtime.terrain, { mobile: this.mobile });
		this.errors = [];
		this.trees = this.placements.flatMap(placement => this.createTree(placement));
		for (const tree of this.trees) {
			this.group.add(tree);
		}
		this.clock = 0;
	}

	createTree(placement) {
		try {
			return [createMinimalMeadowTree(placement, this.materials)];
		} catch (error) {
			this.errors.push({ id: placement.id, message: error.message });
			return [];
		}
	}

	update(deltaSeconds) {
		this.clock += deltaSeconds;
		for (let index = 0; index < this.trees.length; index += 1) {
			this.trees[index].quaternion.z = Math.sin(this.clock * 0.48 + index * 1.37) * 0.0045;
		}
	}

	diagnostics() {
		return minimalMeadowTreeDiagnostics(this);
	}

	destroy() {
		this.group.parent?.remove(this.group);
		if (this.runtime.trees === this) {
			this.runtime.trees = null;
		}
	}
}

function mobileProfile(runtime) {
	const environment = runtime.environment || globalThis;
	return Number(environment.innerWidth || 1024) <= 820
		|| Boolean(environment.matchMedia?.('(pointer: coarse)')?.matches);
}
