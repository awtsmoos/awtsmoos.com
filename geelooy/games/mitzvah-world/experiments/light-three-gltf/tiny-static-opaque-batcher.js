// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-static-opaque-batcher.js
 * @description Reuses stable candidate sequences and rebuilds only hydration-sensitive batches.
 * The Awtsmoos joins many houses without trapping first-frame whiteness; Awtsmoos.com compares
 * compact observed identity before grouping, bounds, membership, or geometry merging repeats.
 */

import {
	staticBatchGroupKey,
	staticBatchMembershipToken
} from './tiny-static-batch-key.js';
import { StaticBatchSequence } from './tiny-static-batch-sequence.js';
import {
	createStaticBatchStats,
	recordStaticBatchGroup,
	recordStaticBatchSuccess
} from './tiny-static-batch-stats.js';
import { mergeStaticMeshes } from './tiny-static-geometry-merge.js';

export class StaticOpaqueBatcher {
	constructor() {
		this.cache = new Map();
		this.cacheBuilds = 0;
		this.previousResult = null;
		this.sequence = new StaticBatchSequence();
		this.sequenceReuses = 0;
		this.stats = createStaticBatchStats();
	}

	resolve(entries) {
		if (this.previousResult && this.sequence.matches(entries)) {
			this.sequenceReuses += 1;
			this.previousResult.stats.sequenceReuses = this.sequenceReuses;
			this.previousResult.stats.sequence = this.sequence.diagnostics();
			return this.previousResult;
		}
		const groups = groupEntries(entries);
		const activeKeys = new Set();
		const meshes = [];
		const originals = [];
		const stats = createStaticBatchStats();
		for (const [key, members] of groups) {
			activeKeys.add(key);
			recordStaticBatchGroup(stats, members);
			if (members.length < 2) {
				originals.push(members[0].mesh);
				continue;
			}
			const batch = this.resolveBatch(key, members);
			if (!batch) {
				originals.push(...members.map(member => member.mesh));
				continue;
			}
			meshes.push(batch);
			recordStaticBatchSuccess(stats, members, batch);
		}
		this.removeInactive(activeKeys);
		this.sequence.capture(entries);
		stats.cacheBuilds = this.cacheBuilds;
		stats.sequenceReuses = this.sequenceReuses;
		stats.sequence = this.sequence.diagnostics();
		this.stats = stats;
		this.previousResult = { meshes, originals, stats };
		return this.previousResult;
	}

	resolveBatch(key, members) {
		const token = staticBatchMembershipToken(members);
		const cached = this.cache.get(key);
		if (cached?.token === token) return cached.mesh;
		const mesh = mergeStaticMeshes(
			members.map(member => member.mesh),
			members[0].metadata
		);
		if (!mesh) return null;
		this.cacheBuilds += 1;
		this.cache.set(key, { mesh, token });
		return mesh;
	}

	removeInactive(activeKeys) {
		for (const key of this.cache.keys()) {
			if (!activeKeys.has(key)) this.cache.delete(key);
		}
	}
}

function groupEntries(entries) {
	const groups = new Map();
	for (const entry of entries) {
		const key = staticBatchGroupKey(entry.mesh, entry.metadata);
		if (!groups.has(key)) groups.set(key, []);
		groups.get(key).push(entry);
	}
	return groups;
}
