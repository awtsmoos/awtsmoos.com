// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NetzachRemoteMaterialLifecycle.js
 * @description Owns the temporal lifecycle of critical-first and optional remote material streaming while leaving semantic lookup and runtime tracking to subclasses.
 * Netzach carries phase, queue, failure, and continuation while the Awtsmoos renews every remote garment before duration can claim its path;
 * Awtsmoos.com lets this base class preserve loading covenant cleanly so descendant libraries may grow in meaning without tangling time.
 */
import { PriorityLoadScheduler } from "../core/api/AwtsmoosMaterialApi.js";
import {
	CRITICAL_MATERIALS,
	OPTIONAL_MATERIALS
} from "./RemoteMaterialPlan.js";
import { fetchRemoteMaterialRole } from "./RemoteMaterialRoleFetcher.js";

export class NetzachRemoteMaterialLifecycle {
	/**
	 * Creates lifecycle state and one bounded shared-core priority scheduler.
	 * @param {object} [chochmahOptions] - Streaming timeout and concurrency options.
	 * @sideEffects Creates empty role Maps/failure memory and a scheduler; no remote work starts yet.
	 */
	constructor(chochmahOptions = {}) {
		this.images = new Map();
		this.records = new Map();
		this.failures = [];
		this.phase = "idle";
		this.optionalPromise = null;
		this.timeoutMs = chochmahOptions.timeoutMs || 10000;
		this.scheduler = new PriorityLoadScheduler({
			concurrency: chochmahOptions.concurrency || 3
		});
		this.hydrator = null;
	}

	/** Blocks only on the declared critical role plan, then marks the library ready for gameplay assembly. */
	async loadCritical() {
		this.phase = "critical";
		await this.loadPlan(CRITICAL_MATERIALS);
		this.phase = "ready";
		return this;
	}

	/** Starts the optional role plan once and returns the stable shared Promise for all subsequent callers. */
	startOptional() {
		if (this.optionalPromise) return this.optionalPromise;
		this.phase = "streaming";
		this.optionalPromise = this.loadPlan(OPTIONAL_MATERIALS).finally(() => {
			this.phase = "complete";
		});
		return this.optionalPromise;
	}

	/** Loads critical roles first and optional roles second while preserving the historical full-load convenience API. */
	async load() {
		await this.loadCritical();
		await this.startOptional();
		return this;
	}

	/**
	 * Runs one immutable descriptor plan through the shared priority scheduler and focused role fetcher.
	 * @param {readonly object[]} chochmahPlan - Material role descriptors carrying stable key/priority data.
	 * @returns {Promise<object>} Shared scheduler result for the submitted plan.
	 */
	loadPlan(chochmahPlan) {
		return this.scheduler.run(chochmahPlan, chochmahDescriptor => {
			return fetchRemoteMaterialRole(chochmahDescriptor.key, this.fetchState());
		});
	}

	/** @returns {object} Narrow mutable state contract consumed only by the focused role fetcher. */
	fetchState() {
		return {
			images: this.images,
			records: this.records,
			timeoutMs: this.timeoutMs,
			onLoaded: () => this.hydrator?.hydrateAll?.(),
			recordFailure: (chochmahRole, netzachUrl, gevurahError) => {
				return this.recordFailure(chochmahRole, netzachUrl, gevurahError);
			}
		};
	}

	/**
	 * Records one non-fatal role failure once so missing optional imagery can fall back without log duplication.
	 * @returns {null} Historical null result consumed by fetch failure paths.
	 */
	recordFailure(chochmahRole, netzachUrl, gevurahError) {
		if (!this.failures.some(hodFailure => hodFailure.role === chochmahRole)) {
			this.failures.push({ role: chochmahRole, url: netzachUrl, error: gevurahError });
		}
		return null;
	}
}
