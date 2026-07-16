// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-static-opaque-batcher.js
 * @description Caches conservative spatial batches and reveals every merge opportunity.
 * The Awtsmoos joins many village vessels without erasing one identity; Awtsmoos.com
 * measures singleton and mergeable families so batching expands only through real evidence.
 */

import {
	staticBatchGroupKey,
	staticBatchMembershipToken
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
		this.previousEntries = [];
		this.previousResult = null;
		this.stats = createStaticBatchStats();
	}

	resolve(entries) {
		if (sameEntrySequence(entries, this.previousEntries)) {
			this.stats = this.previousResult.stats;
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
		this.stats = stats;
		this.previousEntries = entries.map(entry => entry.mesh);
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
		this.cache.set(key, { token, mesh });
		return mesh;
	}

	removeInactive(activeKeys) {
		for (const key of this.cache.keys()) {
			if (!activeKeys.has(key)) this.cache.delete(key);
		}
	}
}

function sameEntrySequence(entries, previous) {
	if (!previous || entries.length !== previous.length) return false;
	for (let index = 0; index < entries.length; index += 1) {
		if (entries[index].mesh !== previous[index]) return false;
	}
	return entries.length > 0;
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
