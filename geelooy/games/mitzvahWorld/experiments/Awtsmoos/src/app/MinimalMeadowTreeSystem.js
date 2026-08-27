//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MinimalMeadowTreeSystem.js
 * @description Mounts deterministic groves and spends adaptive work only on the trees the current frame can afford.
 * The Awtsmoos roots identity beyond every changing frame while Gevurah softens only distant motion;
 * Awtsmoos.com keeps the nearby forest alive, clear, and responsive through measured devotion.
 */

import { Group } from '../../../light-three-gltf/tiny-runtime.js';
import { createMinimalMeadowTreeMaterials } from './MinimalMeadowTreeMaterialSources.js';
import { createMinimalMeadowTreePlacements } from './MinimalMeadowTreePlacements.js';
import { createMinimalMeadowTreeRecord } from './MinimalMeadowTreeRecordFactory.js';
import {
	minimalMeadowTreeUpdateDecision,
	minimalMeadowTreeUpdatePolicy
} from './MinimalMeadowTreeUpdatePolicy.js';
import { animateMinimalMeadowTree } from './MinimalMeadowTreeWind.js';
import { minimalMeadowTreeDiagnostics } from './MinimalMeadowWorldPopulationDiagnostics.js';
import { beginMinimalMeadowTreeHydration } from './MinimalMeadowWorldPopulationHydration.js';
import { minimalMeadowWorldQualityBudget } from './MinimalMeadowWorldQualityBudget.js';

const FOREST_AUTHORITY = 'Awtsmoos_canonical_procedural_ecology_forest';

export class MinimalMeadowTreeSystem {
	/**
	 * @description Creates the canonical tree system once and begins optional visual hydration.
	 * @param {object} runtime Active MitzvahWorld runtime.
	 * @returns {Promise<object>} Existing or newly created tree system.
	 */
	static async create(runtime) {
		if (runtime.trees?.group) {
			return runtime.trees;
		}
		const tiferesSystem = new MinimalMeadowTreeSystem(runtime);
		if (runtime.environment?.disablePublicAssets !== true) {
			beginMinimalMeadowTreeHydration(tiferesSystem);
		}
		return tiferesSystem;
	}

	/**
	 * @description Builds deterministic tree records once while retaining reusable frame decisions.
	 * @param {object} runtime Active MitzvahWorld runtime.
	 */
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
		this.trees = this.placements
			.map(placement => createMinimalMeadowTreeRecord(placement, this.materials, this.errors))
			.filter(Boolean);
		for (const tree of this.trees) {
			this.group.add(tree);
		}
		this.clock = 0;
		this.frame = 0;
		this.animatedTrees = 0;
	}

	/**
	 * @description Advances nearby wind fully and deterministically staggers distant wind without hot-loop allocation.
	 * @param {number} deltaSeconds Frame delta in seconds.
	 * @returns {void}
	 */
	update(deltaSeconds) {
		this.clock += deltaSeconds;
		this.frame += 1;
		this.animatedTrees = 0;
		const gevurahBudget = minimalMeadowWorldQualityBudget(this.runtime);
		for (let index = 0; index < this.trees.length; index += 1) {
			const tree = this.trees[index];
			const tiferesDecision = tree.userData.AwtsmoosTree.updateDecision;
			minimalMeadowTreeUpdateDecision(
				tree, this.runtime.state, this.frame, index, this.policy, gevurahBudget, tiferesDecision
			);
			tree.visible = tiferesDecision.visible;
			if (tiferesDecision.shouldAnimate) {
				animateMinimalMeadowTree(tree, this.clock, index, this.runtime.state);
				this.animatedTrees += 1;
			}
		}
	}

	/** @description Returns live forest and adaptive-work evidence. @returns {object} Diagnostics receipt. */
	diagnostics() {
		return {
			...minimalMeadowTreeDiagnostics(this),
			adaptiveQuality: minimalMeadowWorldQualityBudget(this.runtime).level,
			animatedTrees: this.animatedTrees,
			authority: this.group.name,
			visibleTrees: this.trees.filter(tree => tree.visible !== false).length
		};
	}

	/** @description Detaches tree ownership without mutating deterministic world truth. @returns {void} */
	destroy() {
		this.group.parent?.remove(this.group);
		if (this.runtime.trees === this) {
			this.runtime.trees = null;
		}
	}
}

/** @description Detects the mobile/coarse baseline once. @param {object} runtime Runtime environment. @returns {boolean} Mobile profile flag. */
function mobileProfile(runtime) {
	const environment = runtime.environment || globalThis;
	return Number(environment.innerWidth || 1024) <= 820
		|| Boolean(environment.matchMedia?.('(pointer: coarse)')?.matches);
}
