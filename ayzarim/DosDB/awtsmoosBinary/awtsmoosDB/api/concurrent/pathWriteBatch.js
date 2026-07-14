// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file api/concurrent/pathWriteBatch.js
 * @chapter Many Sibling Names Enter One Parent Vessel
 * @description
 * Coalesces writes that share a parent path, acquires one semantic gate, and
 * replaces that parent once. The Awtsmoos gathers many requested names into one
 * durable generation without repeating hydration, builder work, or complement
 * verification for each leaf.
 */

class PathWriteBatch {
	constructor(database, pathLocks, access) {
		this.db = database;
		this.pathLocks = pathLocks;
		this.access = access;
		this.pending = [];
		this.scheduled = false;
	}

	enqueue(parts, value) {
		return new Promise((resolve, reject) => {
			this.pending.push({ parts, value, resolve, reject });
			if (this.scheduled) return;
			this.scheduled = true;
			queueMicrotask(() => this.flush());
		});
	}

	flush() {
		const batch = this.pending.splice(0);
		this.scheduled = false;
		if (!batch.length) return;
		for (const group of this._groups(batch).values()) {
			const promise = this.pathLocks.write(group.parentParts, () => {
				this._apply(group.parentParts, group.items);
				for (const item of group.items) item.resolve(item.value);
			});
			Promise.resolve(promise).catch(error => {
				for (const item of group.items) item.reject(error);
			});
		}
	}

	_groups(batch) {
		const groups = new Map();
		for (const item of batch) {
			const parentParts = item.parts.slice(0, -1);
			const identity = JSON.stringify(parentParts);
			if (!groups.has(identity)) groups.set(identity, { parentParts, items: [] });
			groups.get(identity).items.push(item);
		}
		return groups;
	}

	_apply(parentParts, items) {
		if (items.length === 1 || !parentParts.length) {
			this.db.batch(() => {
				for (const item of items) this.access.set(item.parts, item.value);
			});
			return;
		}
		const target = this.access.parent(parentParts);
		if (!target) {
			this.db.batch(() => {
				for (const item of items) this.access.set(item.parts, item.value);
			});
			return;
		}
		const current = target.parent[target.key];
		let plain = current && typeof current.__resolve__ === 'function'
			? current.__resolve__()
			: current;
		if (!plain || typeof plain !== 'object' || Array.isArray(plain)) plain = {};
		for (const item of items) plain[item.parts[item.parts.length - 1]] = item.value;
		target.parent[target.key] = plain;
	}
}

module.exports = PathWriteBatch;
