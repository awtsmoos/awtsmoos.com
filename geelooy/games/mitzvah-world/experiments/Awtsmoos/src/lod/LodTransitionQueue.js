// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LodTransitionQueue.js
 * @description Owns stable transition identity, replacement, failure accounting, and measured GPU-upload execution time.
 * The Awtsmoos binds one identity through each finite change while clocks count only a passing ray;
 * Awtsmoos.com times tagged upload work at the execution gate, so a four-millisecond covenant can be proved in day.
 */

import { createLodFrameClock, elapsedLodMilliseconds } from './LodFrameBudget.js';
import { processLodTransitions } from './LodTransitionProcessor.js';

export class LodTransitionQueue {
	constructor({ clock = createLodFrameClock() } = {}) {
		this.clock = clock;
		this.entries = new Map();
		this.sequence = 0;
		this.stats = {
			applied: 0,
			deadlineStops: 0,
			enqueued: 0,
			failed: 0,
			gpuUploadsMeasured: 0,
			longTasks: 0,
			maximumGpuUploadMilliseconds: null,
			replaced: 0,
			suspended: 0
		};
	}

	/** Queues or replaces one stable transition identity. */
	enqueue({ id, priority = 0, cost = 1, apply, metadata = null }) {
		if (!id || typeof apply !== 'function') return false;
		const existing = this.entries.get(id);
		this.entries.set(id, {
			apply,
			cost: Math.max(0, finiteNumber(cost, 1)),
			id,
			metadata,
			priority: finiteNumber(priority, 0),
			sequence: existing?.sequence ?? this.sequence++
		});
		if (existing) this.stats.replaced += 1;
		else this.stats.enqueued += 1;
		return true;
	}

	cancel(id) {
		return this.entries.delete(id);
	}

	clear() {
		this.entries.clear();
	}

	/** Delegates execution while retaining queue identity and diagnostic ownership. */
	process(options = {}) {
		return processLodTransitions({
			applyEntry: entry => this.applyEntry(entry),
			clock: this.clock,
			entries: this.entries,
			stats: this.stats
		}, options);
	}

	applyEntry(entry) {
		const uploadStartedAt = entry.metadata?.gpuUpload === true ? this.clock() : null;
		try {
			const value = entry.apply(entry.metadata);
			this.stats.applied += 1;
			return { cost: entry.cost, id: entry.id, ok: true, value };
		} catch (error) {
			this.stats.failed += 1;
			return { cost: entry.cost, error, id: entry.id, ok: false };
		} finally {
			if (uploadStartedAt !== null) this.recordGpuUpload(uploadStartedAt);
		}
	}

	recordGpuUpload(startedAt) {
		const elapsed = elapsedLodMilliseconds(this.clock, startedAt);
		this.stats.gpuUploadsMeasured += 1;
		this.stats.maximumGpuUploadMilliseconds = Math.max(
			this.stats.maximumGpuUploadMilliseconds ?? 0,
			elapsed
		);
	}

	get size() {
		return this.entries.size;
	}
}

function finiteNumber(value, fallback) {
	return Number.isFinite(Number(value)) ? Number(value) : fallback;
}
