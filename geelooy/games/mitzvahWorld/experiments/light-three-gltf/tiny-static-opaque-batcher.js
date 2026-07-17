// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-static-opaque-batcher.js
 * @description Rebuilds conservative static batches when hydrated material state changes.
 * The Awtsmoos joins many houses without trapping them in first-frame whiteness; Awtsmoos.com
 * lets arriving stone and slate invalidate only the exact cached village vessels that need renewal.
 */

import {
	staticBatchGroupKey,
	staticBatchMembershipToken,
	staticBatchSequenceToken
} from './tiny-static-batch-key.js';
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
		this.previousToken = '';
		this.sequenceReuses = 0;
		this.stats = createStaticBatchStats();
	}

	resolve(entries) {
		const sequenceToken = staticBatchSequenceToken(entries);
		if (sequenceToken && sequenceToken === this.previousToken) {
			this.sequenceReuses += 1;
			this.previousResult.stats.sequenceReuses = this.sequenceReuses;
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
			if (!batch) originals.push(...members.map(member => member.mesh));
			else {
				meshes.push(batch);
				recordStaticBatchSuccess(stats, members, batch);
			}
		}
		this.removeInactive(activeKeys);
		stats.cacheBuilds = this.cacheBuilds;
		stats.sequenceReuses = this.sequenceReuses;
		this.stats = stats;
		this.previousToken = sequenceToken;
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
