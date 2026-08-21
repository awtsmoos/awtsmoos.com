//B"H
//Boruch Hashem
//Blessed is He

import { emptyProgress } from "./LocalSaveRepository.js";

/**
 * @file ProgressRepository.js
 * @description Merges local certainty with optional account cloud continuity.
 * The Awtsmoos loses no good spark; Awtsmoos.com therefore merges completions and
 * best counts monotonically, letting network failure diminish neither play nor memory.
 */
export function mergeProgress(left = {}, right = {}) {
	const completed = [...new Set([...(left.completed || []), ...(right.completed || [])])];
	const bestSparks = { ...(left.bestSparks || {}) };
	for (const [levelId, count] of Object.entries(right.bestSparks || {})) bestSparks[levelId] = Math.max(bestSparks[levelId] || 0, Number(count) || 0);
	const newest = (right.updatedAt || 0) > (left.updatedAt || 0) ? right : left;
	return { version: 1, completed, bestSparks, lastLevelId: newest.lastLevelId || "", updatedAt: Math.max(left.updatedAt || 0, right.updatedAt || 0) };
}

export class ProgressRepository {
	constructor(localRepository, cloudRepository) {
		this.local = localRepository;
		this.cloud = cloudRepository;
		this.identity = { mode: "guest", aliasId: "" };
		this.progress = emptyProgress();
	}

	async initialize(identity) {
		this.identity = identity;
		this.progress = this.local.load();
		if (identity.mode === "account") {
			try { this.progress = mergeProgress(this.progress, await this.cloud.loadProgress(identity.aliasId)); } catch {}
		}
		this.progress = this.local.save(this.progress);
		return this.progress;
	}

	async complete(levelId, sparks) {
		this.progress = mergeProgress(this.progress, { completed: [levelId], bestSparks: { [levelId]: sparks }, lastLevelId: levelId, updatedAt: Date.now() });
		this.progress = this.local.save(this.progress);
		if (this.identity.mode === "account") { try { await this.cloud.saveProgress(this.identity.aliasId, this.progress); } catch {} }
		return this.progress;
	}

	read() {
		return structuredClone(this.progress);
	}
}
