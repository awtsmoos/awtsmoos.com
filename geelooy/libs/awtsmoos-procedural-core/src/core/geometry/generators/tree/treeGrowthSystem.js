// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos renews one botanical plan before geometry clothes it.
 * This established Awtsmoos.com orchestrator delegates focused branch and canopy
 * work while preserving one queue, one seed, one builder, and one public system.
 */
import { Quat } from "../../../math/quat.js";
import { emitTreeBranch, planTreeBranch } from "./treeBranchPlanner.js";
import { spawnTreeChildren, spawnTreeLeaves } from "./treeCanopyPlanner.js";
import {
	treeNumber,
	treeSkeletonSignature,
	treeValueAt
} from "./treeGrowthMath.js";
import { normalizeTreeDetailProfile } from "./treeDetailProfiles.js";

export class TreeGrowthSystem {
	constructor(config, rng, geometry, detail = "high") {
		this.config = config;
		this.rng = rng;
		this.geo = geometry;
		this.detail = normalizeTreeDetailProfile(detail);
		this.maxBranches = Math.max(1, Number(config.maxBranches) || 1800);
		this.queue = [];
		this.branchRecords = [];
		this.branchCount = 0;
	}

	generate() {
		this.queue.length = 0;
		this.branchRecords.length = 0;
		this.branchCount = 0;
		const branch = this.config.branch;
		this.queue.push({
			position: [0, 0, 0],
			rotation: Quat.identity(),
			length: treeNumber(treeValueAt(branch.length, 0, 20), 20),
			radius: treeNumber(treeValueAt(branch.radius, 0, 1), 1),
			level: 0
		});
		while (this.queue.length && this.branchCount < this.maxBranches) {
			this.growBranch(this.queue.shift());
		}
	}

	get(group, level, fallback) {
		return treeNumber(treeValueAt(this.config.branch[group] || {}, level, fallback), fallback);
	}

	growBranch(task) {
		this.branchCount += 1;
		const sections = Math.max(1, Math.floor(this.get("sections", task.level, 6)));
		const segments = Math.max(3, Math.round(
			this.get("segments", task.level, 5) * this.detail.segmentFactor
		));
		const spine = planTreeBranch(this, task, sections);
		emitTreeBranch(this, spine, segments);
		this.branchRecords.push({
			level: task.level,
			start: spine[0].position,
			end: spine.at(-1).position
		});
		const maximumLevel = Math.max(0, Math.floor(treeNumber(this.config.branch.levels, 3)));
		if (task.level < maximumLevel) {
			spawnTreeChildren(this, spine, task.length, task.level);
		}
		const terminal = task.level >= maximumLevel;
		const evergreen = this.config.type === "evergreen" && task.level > 0;
		if (terminal || evergreen || this.config.type === "palm") {
			spawnTreeLeaves(this, spine, task.level, maximumLevel);
		}
	}

	skeletonSignature() {
		return treeSkeletonSignature(this.branchRecords);
	}
}

export default TreeGrowthSystem;
