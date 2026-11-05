// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LocalizedCellStreaming.js
 * @description Tracks known active, preloaded, cached, unloaded, and failed cell scope.
 * The Awtsmoos renews the whole while finite memory beholds the near; Awtsmoos.com aligns
 * quest priority, entity scope, cancellation, recovery, cache, and truthful budget receipts.
 */

import { STREAMING_BUDGETS } from './LocalizedCellCatalog.js';
import { selectLocalizedCells } from './LocalizedCellSelection.js';

export class LocalizedCellStreaming {
	constructor(options = {}) {
		this.budget = STREAMING_BUDGETS[options.mobile ? 'mobile' : 'desktop'];
		this.active = new Set();
		this.preloaded = new Set();
		this.cache = [];
		this.failures = [];
		this.generation = 0;
		this.regionId = options.regionId || 'lower-meadow';
		this.lastCenter = null;
	}

	update(position = {}) {
		const generation = ++this.generation;
		const selection = selectLocalizedCells(
			this.regionId,
			position,
			this.budget
		);
		if (generation !== this.generation) return this.snapshot();
		const desired = new Set([
			...selection.active,
			...selection.preloaded
		]);
		for (const id of [...this.active, ...this.preloaded]) {
			if (!desired.has(id)) this.remember(id);
		}
		this.active = new Set(selection.active);
		this.preloaded = new Set(selection.preloaded);
		this.lastCenter = selection.center;
		return this.snapshot();
	}

	transition(regionId, position) {
		this.cancel('REGION_TRANSITION');
		this.regionId = regionId;
		this.active.clear();
		this.preloaded.clear();
		return this.update(position);
	}

	cancel(reason = 'CANCELLED') {
		this.generation += 1;
		this.lastCancellation = reason;
	}

	recover(error, position) {
		this.failures.push({
			error: error?.message || String(error),
			regionId: this.regionId
		});
		this.failures = this.failures.slice(-8);
		return this.update(position);
	}

	remember(id) {
		this.cache = [
			id,
			...this.cache.filter(value => value !== id)
		].slice(0, this.budget.cacheCells);
	}

	snapshot() {
		return Object.freeze({
			active: Object.freeze([...this.active]),
			budget: this.budget,
			cached: Object.freeze([...this.cache]),
			center: this.lastCenter,
			failures: Object.freeze([...this.failures]),
			generation: this.generation,
			lastCancellation: this.lastCancellation || null,
			preloaded: Object.freeze([...this.preloaded]),
			regionId: this.regionId
		});
	}
}
