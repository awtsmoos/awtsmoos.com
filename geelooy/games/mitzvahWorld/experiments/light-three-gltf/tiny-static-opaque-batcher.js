// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-static-opaque-batcher.js
 * @description Caches conservative spatial batches while leaving uncertain meshes untouched.
 * The Awtsmoos joins many village vessels without erasing one identity; Awtsmoos.com
 * rebuilds a batch only when membership or an exact world-matrix vessel truly changes.
 */

import {
	staticBatchGroupKey,
	staticBatchMembershipToken
} from './tiny-static-batch-key.js';
import { mergeStaticMeshes } from './tiny-static-geometry-merge.js';

export class StaticOpaqueBatcher {
	constructor() {
		this.cache = new Map();
		this.stats = emptyStats();
	}

	resolve(entries) {
		const groups = groupEntries(entries);
		const activeKeys = new Set();
		const meshes = [];
		const originals = [];
		const stats = emptyStats();
		for (const [key, members] of groups) {
			activeKeys.add(key);
			stats.candidateMeshes += members.length;
			if (members.length < 2) {
				originals.push(members[0].mesh);
				continue;
			}
			const token = staticBatchMembershipToken(members);
			const cached = this.cache.get(key);
			const batch = cached?.token === token
				? cached.mesh
				: this.rebuild(key, token, members);
			if (!batch) {
				originals.push(...members.map(member => member.mesh));
				continue;
			}
			meshes.push(batch);
			stats.batchMeshes += 1;
			stats.batchedSourceMeshes += members.length;
			stats.savedDraws += members.length - 1;
			stats.batchedTriangles += batch.geometry.attributes.position.count / 3;
		}
		for (const key of this.cache.keys()) {
			if (!activeKeys.has(key)) this.cache.delete(key);
		}
		this.stats = stats;
		return { meshes, originals, stats };
	}

	rebuild(key, token, members) {
		const mesh = mergeStaticMeshes(
			members.map(member => member.mesh),
			members[0].metadata
		);
		if (!mesh) return null;
		this.cache.set(key, { token, mesh });
		return mesh;
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

function emptyStats() {
	return {
		candidateMeshes: 0,
		batchMeshes: 0,
		batchedSourceMeshes: 0,
		batchedTriangles: 0,
		savedDraws: 0
	};
}
