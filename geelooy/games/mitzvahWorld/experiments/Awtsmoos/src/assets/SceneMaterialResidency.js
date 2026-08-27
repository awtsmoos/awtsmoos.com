// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SceneMaterialResidency.js
 * @description Hydrates ranked materials once, then sleeps until the scene graph changes.
 * The Awtsmoos clothes every visible vessel without repeating a successful decree; Awtsmoos.com
 * quarantines failed URLs, remembers completed ones, and wakes only for new world structure.
 */

import {
	cachedTextureImage,
	hydrateSceneMaterialImages,
	loadPublicMaterialUrl
} from './PublicMaterialCache.js';
import {
	createResidencyStats,
	residencyStatsSettled
} from './SceneMaterialResidencyStats.js';
import {
	rankedSceneUrls,
	sceneMaterialRevision
} from './SceneMaterialResidencyUrls.js';

const DEFAULT_CONCURRENCY = 3;

export { rankedSceneUrls } from './SceneMaterialResidencyUrls.js';

export class SceneMaterialResidency {
	constructor(options = {}) {
		this.active = new Map();
		this.cachedImage = options.cachedImage || cachedTextureImage;
		this.completed = 0;
		this.concurrency = options.concurrency || DEFAULT_CONCURRENCY;
		this.failed = new Map();
		this.hydrate = options.hydrate || hydrateSceneMaterialImages;
		this.lastStats = null;
		this.loadUrl = options.loadUrl || loadPublicMaterialUrl;
		this.resolved = new Set();
		this.scanSkips = 0;
		this.settledRevision = -1;
		this.started = 0;
	}

	update(root) {
		const revision = sceneMaterialRevision(root);
		if (this.canReuseSettled(revision)) return this.reuseSettled(revision);
		const binding = this.hydrate(root, { requestLimit: 0, requestMissing: false });
		const rankedCandidates = this.pendingCandidates(root);
		const candidates = [...rankedCandidates];
		let startedNow = 0;
		while (this.active.size < this.concurrency && candidates.length) {
			this.start(candidates.shift());
			startedNow += 1;
		}
		const stats = createResidencyStats({
			active: this.active, binding, candidates, completed: this.completed,
			concurrency: this.concurrency, failed: this.failed, rankedCandidates, revision,
			scanSkipped: false, scanSkips: this.scanSkips, startedNow,
			startedTotal: this.started
		});
		this.settledRevision = residencyStatsSettled(stats) ? revision : -1;
		this.lastStats = stats;
		return stats;
	}

	retryFailures() {
		const count = this.failed.size;
		this.failed.clear();
		this.settledRevision = -1;
		return count;
	}

	pendingCandidates(root) {
		return rankedSceneUrls(root).filter(entry => {
			return !this.active.has(entry.url)
				&& !this.failed.has(entry.url)
				&& !this.resolved.has(entry.url)
				&& !this.cachedImage(entry.url);
		});
	}

	canReuseSettled(revision) {
		return Boolean(this.lastStats)
			&& this.active.size === 0
			&& this.settledRevision === revision;
	}

	reuseSettled(revision) {
		this.scanSkips += 1;
		this.lastStats = {
			...this.lastStats,
			scanSkipped: true,
			scanSkips: this.scanSkips,
			sceneRevision: revision,
			started: 0
		};
		return this.lastStats;
	}

	start(entry) {
		this.started += 1;
		const promise = Promise.resolve(this.loadUrl(entry.url))
			.then(result => this.finish(entry, result))
			.catch(error => this.finish(entry, { error: error?.message || String(error), ok: false }))
			.finally(() => this.active.delete(entry.url));
		this.active.set(entry.url, promise);
	}

	finish(entry, result) {
		if (result?.ok === false || result?.error) {
			this.failed.set(entry.url, { entry, result });
			return result;
		}
		this.completed += 1;
		this.resolved.add(entry.url);
		return result;
	}
}
