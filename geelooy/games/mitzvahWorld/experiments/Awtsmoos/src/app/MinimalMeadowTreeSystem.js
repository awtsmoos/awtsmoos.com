// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowTreeSystem.js
 * @description Mounts one canonical ecology forest with semantic materials, frustum culling, and distance-tiered rooted wind.
 * The Awtsmoos reveals trunk, crown, grove, and breeze in every tree;
 * Awtsmoos.com keeps the procedural-core authority visible in diagnostics while bounded frame work preserves abundance.
 */

import { Group } from '../../../light-three-gltf/tiny-runtime.js';
import { createMinimalMeadowTree } from './MinimalMeadowTreeFactory.js';
import { createMinimalMeadowTreeMaterials } from './MinimalMeadowTreeMaterialSources.js';
import { createMinimalMeadowTreePlacements } from './MinimalMeadowTreePlacements.js';
import {
	minimalMeadowTreeUpdateDecision,
	minimalMeadowTreeUpdatePolicy
} from './MinimalMeadowTreeUpdatePolicy.js';
import { animateMinimalMeadowTree } from './MinimalMeadowTreeWind.js';
import { minimalMeadowTreeDiagnostics } from './MinimalMeadowWorldPopulationDiagnostics.js';
import { beginMinimalMeadowTreeHydration } from './MinimalMeadowWorldPopulationHydration.js';

const FOREST_AUTHORITY = 'Awtsmoos_canonical_procedural_ecology_forest';

export class MinimalMeadowTreeSystem {
	static async create(runtime) {
		if (runtime.trees?.group) return runtime.trees;
		const system = new MinimalMeadowTreeSystem(runtime);
		if (runtime.environment?.disablePublicAssets !== true) beginMinimalMeadowTreeHydration(system);
		return system;
	}

	constructor(runtime) {
		this.runtime = runtime;
		this.group = new Group();
		this.group.name = FOREST_AUTHORITY;
		this.mobile = mobileProfile(runtime);
		this.policy = minimalMeadowTreeUpdatePolicy(this.mobile);
		this.records = [];
		this.hydrationState = 'procedural-visible';
		this.materials = createMinimalMeadowTreeMaterials([], runtime.environment?.document);
		this.placements = createMinimalMeadowTreePlacements(runtime.terrain, { mobile: this.mobile });
		this.errors = [];
		this.trees = this.placements.flatMap(placement => this.createTree(placement));
		for (const tree of this.trees) this.group.add(tree);
		this.clock = 0;
		this.frame = 0;
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
		this.frame += 1;
		for (let index = 0; index < this.trees.length; index += 1) {
			const tree = this.trees[index];
			const decision = minimalMeadowTreeUpdateDecision(tree, this.runtime.state, this.frame, index, this.policy);
			tree.visible = decision.visible;
			tree.userData.AwtsmoosTree.updateDecision = decision;
			if (decision.shouldAnimate) animateMinimalMeadowTree(tree, this.clock, index, this.runtime.state);
		}
	}

	diagnostics() {
		return {
			...minimalMeadowTreeDiagnostics(this),
			authority: this.group.name,
			ecologyTaggedTrees: this.trees.filter(tree => tree.userData?.AwtsmoosTreeEcology).length,
			visibleTrees: this.trees.filter(tree => tree.visible !== false).length
		};
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
