// B"H

/**
 * Applies a bounded number of LOD changes per frame. Higher priority wins, then
 * older work, so a cell crossing cannot become one giant frame-long rupture.
 */
export class LodTransitionQueue {
	constructor() {
		this.entries = new Map();
		this.sequence = 0;
		this.stats = {
			enqueued: 0,
			replaced: 0,
			applied: 0,
			failed: 0
		};
	}

	enqueue({
		id,
		priority = 0,
		cost = 1,
		apply,
		metadata = null
	}) {
		if (!id || typeof apply !== 'function') return false;
		const existing = this.entries.get(id);
		const entry = {
			id,
			priority: finiteNumber(priority, 0),
			cost: Math.max(0, finiteNumber(cost, 1)),
			apply,
			metadata,
			sequence: existing?.sequence ?? this.sequence++
		};
		if (existing) this.stats.replaced += 1;
		else this.stats.enqueued += 1;
		this.entries.set(id, entry);
		return true;
	}

	cancel(id) {
		return this.entries.delete(id);
	}

	clear() {
		this.entries.clear();
	}

	process({ maximumTransitions = 4, maximumCost = Infinity } = {}) {
		const ordered = [...this.entries.values()].sort(compareEntries);
		const results = [];
		let usedCost = 0;
		for (const entry of ordered) {
			if (results.length >= maximumTransitions) break;
			if (usedCost + entry.cost > maximumCost) continue;
			this.entries.delete(entry.id);
			try {
				const value = entry.apply(entry.metadata);
				usedCost += entry.cost;
				this.stats.applied += 1;
				results.push({
					id: entry.id,
					ok: true,
					value,
					cost: entry.cost
				});
			} catch (error) {
				this.stats.failed += 1;
				results.push({
					id: entry.id,
					ok: false,
					error,
					cost: entry.cost
				});
			}
		}
		return {
			results,
			usedCost,
			remaining: this.entries.size
		};
	}

	get size() {
		return this.entries.size;
	}
}

function compareEntries(left, right) {
	if (left.priority !== right.priority) return right.priority - left.priority;
	return left.sequence - right.sequence;
}

function finiteNumber(value, fallback) {
	return Number.isFinite(value) ? value : fallback;
}
