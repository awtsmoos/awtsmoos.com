// B"H
// Boruch Hashem
// Blessed is He

/**
 * The historical growth-system API remains one doorway, but no longer owns a
 * second tree algorithm. This Awtsmoos.com adapter compiles the canonical stable
 * skeleton into the established geometry builder and exposes legacy statistics.
 */

import { buildTreeGeometryFromSkeleton } from "./treeGeometryFromSkeleton.js";
import { normalizeTreeDetailProfile } from "./treeDetailProfiles.js";
import { normalizeTreeGeometryProfile } from "./treeGeometryProfile.js";
import { TreeSkeletonGenerator } from "./treeSkeletonGenerator.js";
import { treeSkeletonValue } from "./treeSkeletonMath.js";

export class TreeGrowthSystem {
	constructor(config, rng, geometry, detail = "high", options = {}) {
		this.config = config;
		this.rng = rng;
		this.geo = geometry;
		this.detail = normalizeTreeDetailProfile(detail);
		this.options = options || {};
		this.maxBranches = Math.max(1, Number(config.maxBranches) || 1800);
		this.queue = [];
		this.branchRecords = [];
		this.branchCount = 0;
		this.skeleton = null;
		this.geometryStats = null;
	}

	generate() {
		this.skeleton = new TreeSkeletonGenerator(this.config).generate();
		const geometry = buildTreeGeometryFromSkeleton(
			this.skeleton,
			normalizeTreeGeometryProfile(this.detail),
			this.options.budget || {}
		);
		this.geo.replaceFromCanonicalGeometry(geometry);
		this.branchCount = this.skeleton.branches.length;
		this.geometryStats = geometry.stats;
		this.queue = [];
		this.branchRecords = this.skeleton.branches.map((branch) => ({
			id: branch.id,
			parentId: branch.parentId,
			parentNodeId: branch.parentNodeId,
			level: branch.level,
			start: branch.nodes[0].position,
			end: branch.nodes.at(-1).position
		}));
		return this;
	}

	get(group, level, fallback) {
		return treeSkeletonValue(this.config, group, level, fallback);
	}

	growBranch() {
		return this.generate();
	}

	skeletonSignature() {
		return this.skeleton?.contentHash || null;
	}
}

export default TreeGrowthSystem;
