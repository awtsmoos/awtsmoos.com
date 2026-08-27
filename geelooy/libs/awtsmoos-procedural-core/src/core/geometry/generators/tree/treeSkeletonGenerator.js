// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos renews one canonical tree structure before any mesh is chosen.
 * This Awtsmoos.com orchestrator resets every stream per invocation, delegates
 * focused planning, and returns stable renderer-neutral branch and leaf IDs.
 */

import { createTreeRandomStreams } from "./treeRandomStreams.js";
import { TreeSkeletonArtifact } from "./treeSkeletonArtifact.js";
import { growTreeSkeletonBranch } from "./treeSkeletonBranchPlanner.js";
import {
	enqueueTreeSkeletonChildren,
	placeTreeSkeletonLeaves
} from "./treeSkeletonCanopyPlanner.js";
import { treeSkeletonValue } from "./treeSkeletonMath.js";

export class TreeSkeletonGenerator {
	constructor(config) {
		this.config = config;
		this.maximumBranches = Math.max(1, Number(config.maxBranches || 1800));
		this.streams = null;
		this.branches = [];
		this.leaves = [];
	}

	generate() {
		this.streams = createTreeRandomStreams(this.config.seed);
		this.branches = [];
		this.leaves = [];
		const queue = [this.createRoot()];
		while (queue.length > 0 && this.branches.length < this.maximumBranches) {
			const request = queue.shift();
			const branch = growTreeSkeletonBranch(this, request, this.branches.length);
			this.branches.push(branch);
			enqueueTreeSkeletonChildren(this, branch, queue);
			placeTreeSkeletonLeaves(this, branch);
		}
		return new TreeSkeletonArtifact({
			seed: this.streams.seed,
			preset: this.config.name,
			branches: Object.freeze([...this.branches]),
			leaves: Object.freeze([...this.leaves])
		});
	}

	createRoot() {
		return {
			parentId: null,
			level: 0,
			position: [0, 0, 0],
			direction: [0, 1, 0],
			length: treeSkeletonValue(this.config, "length", 0, 20),
			radius: treeSkeletonValue(this.config, "radius", 0, 1)
		};
	}
}
