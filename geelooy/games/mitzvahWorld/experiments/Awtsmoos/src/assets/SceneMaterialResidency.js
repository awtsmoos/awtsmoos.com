// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SceneMaterialResidency.js
 * @description Hydrates shared cottage and village textures through bounded background workers.
 * The Awtsmoos clothes inhabited homes before distant ornament; Awtsmoos.com deduplicates
 * every successful source and quarantines a failed URL so it cannot starve all later garments.
 */

import {
	cachedTextureImage,
	hydrateSceneMaterialImages,
	loadPublicMaterialUrl
} from './PublicMaterialCache.js';
import { rankedSceneUrls } from './SceneMaterialPriority.js';

export { rankedSceneUrls } from './SceneMaterialPriority.js';

export class SceneMaterialResidency {
	constructor(options = {}) {
		this.active = new Map();
		this.completed = 0;
		this.concurrency = Math.max(1, Math.min(6, options.concurrency ?? 3));
		this.failed = new Map();
		this.loaded = new Set();
		this.timeoutMs = options.timeoutMs ?? 30000;
		this.cachedImage = options.cachedImage || cachedTextureImage;
		this.hydrate = options.hydrate || hydrateSceneMaterialImages;
		this.loadUrl = options.loadUrl || loadPublicMaterialUrl;
	}

	update(root) {
		const binding = this.hydrate(root, {
			requestLimit: 0,
			retryFailed: false,
			timeoutMs: this.timeoutMs
		});
		const candidates = rankedSceneUrls(root)
			.filter(candidate => !this.loaded.has(candidate.url))
			.filter(candidate => !this.failed.has(candidate.url))
			.filter(candidate => !this.cachedImage(candidate.url))
			.filter(candidate => !this.active.has(candidate.url));
		const available = Math.max(0, this.concurrency - this.active.size);
		for (const candidate of candidates.slice(0, available)) this.start(candidate);
		return {
			active: this.active.size,
			binding,
			completed: this.completed,
			failed: this.failed.size,
			pendingCandidates: candidates.length,
			started: Math.min(available, candidates.length),
			topCandidates: candidates.slice(0, 8).map(candidateEvidence)
		};
	}

	start(candidate) {
		const promise = this.loadUrl(candidate.url, this.timeoutMs)
			.then(record => this.record(candidate, record))
			.catch(error => this.recordFailure(candidate, error))
			.finally(() => this.active.delete(candidate.url));
		this.active.set(candidate.url, promise);
	}

	record(candidate, record) {
		if (record.ok) {
			this.completed += 1;
			this.failed.delete(candidate.url);
			this.loaded.add(candidate.url);
		} else {
			this.failed.set(candidate.url, failedEvidence(candidate, record));
		}
		return record;
	}

	recordFailure(candidate, error) {
		this.failed.set(candidate.url, {
			error: error?.message || String(error),
			role: candidate.role,
			url: candidate.url
		});
		return null;
	}

	retryFailures() {
		this.failed.clear();
	}

	diagnostics() {
		return {
			active: [...this.active.keys()],
			completed: this.completed,
			concurrency: this.concurrency,
			failed: [...this.failed.values()],
			loaded: this.loaded.size
		};
	}
}

function candidateEvidence(candidate) {
	return {
		references: candidate.references,
		role: candidate.role,
		score: candidate.score,
		url: candidate.url
	};
}

function failedEvidence(candidate, record) {
	return {
		error: record.error || 'unavailable',
		method: record.method || null,
		role: candidate.role,
		stage: record.stage || null,
		status: record.status || 0,
		url: candidate.url
	};
}
