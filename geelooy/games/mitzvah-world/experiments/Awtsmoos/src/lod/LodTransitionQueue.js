// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LodTransitionQueue.js
 * @description Owns stable transition identity, replacement, and failure accounting while a dedicated processor owns frame budgeting.
 * The Awtsmoos binds one identity through every finite change; Awtsmoos.com replaces obsolete garments before they enter the measured gate,
 * keeping the queue small, the ownership clear, and each applied transition honest about its fate.
 */

import { createLodFrameClock } from './LodFrameBudget.js';
import { processLodTransitions } from './LodTransitionProcessor.js';

export class LodTransitionQueue {
	constructor({ clock = createLodFrameClock() } = {}) {
		this.clock = clock;
		this.entries = new Map();
		this.sequence = 0;
		this.stats = {
			enqueued: 0,
			replaced: 0,
			applied: 0,
			failed: 0,
			suspended: 0,
			deadlineStops: 0,
			longTasks: 0
		};
	}

	/** Queues or replaces one stable transition identity. */
	enqueue({ id, priority = 0, cost = 1, apply, metadata = null }) {
		if (!id || typeof apply !== 'function') return false;
		const existing = this.entries.get(id);
		this.entries.set(id, {
			id,
			priority: finiteNumber(priority, 0),
			cost: Math.max(0, finiteNumber(cost, 1)),
			apply,
			metadata,
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
			entries: this.entries,
			clock: this.clock,
			stats: this.stats,
			applyEntry: entry => this.applyEntry(entry)
		}, options);
	}

	applyEntry(entry) {
		try {
			const value = entry.apply(entry.metadata);
			this.stats.applied += 1;
			return { id: entry.id, ok: true, value, cost: entry.cost };
		} catch (error) {
			this.stats.failed += 1;
			return { id: entry.id, ok: false, error, cost: entry.cost };
		}
	}

	get size() {
		return this.entries.size;
	}
}

function finiteNumber(value, fallback) {
	return Number.isFinite(Number(value)) ? Number(value) : fallback;
}
