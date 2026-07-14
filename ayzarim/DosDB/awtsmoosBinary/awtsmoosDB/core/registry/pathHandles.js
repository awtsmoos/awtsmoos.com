// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file core/registry/pathHandles.js
 * @chapter Only True Lineage Enters The Canonical Book
 * @description
 * Stores one constant-time pointer/version record for each real database path.
 * Hydration caches and other transient contexts are deliberately excluded: they
 * are not parent/key lineages and must never unify unrelated Map, Set, or object
 * handles. The Awtsmoos reveals one address through many legitimate windows
 * while keeping every foreign context outside the book of ownership.
 */

const books = new WeakMap();

class PathHandleBook {
	static register(state) {
		const identity = this.identity(state);
		if (!identity) return;
		const book = this.book(state.db);
		let record = book.get(identity);
		if (!record) {
			record = {
				pointer: state.ptr,
				type: state.type,
				version: 0
			};
			book.set(identity, record);
		} else {
			state.ptr = record.pointer;
			state.type = record.type;
		}
		state.pathHandleIdentity = identity;
		state.pathHandleVersion = record.version;
	}

	static synchronize(state, pointer, type) {
		const record = this.record(state);
		if (!record) {
			state.ptr = pointer;
			if (type !== undefined && type !== null) state.type = type;
			this.invalidateSoul(state);
			return;
		}
		record.pointer = pointer;
		if (type !== undefined && type !== null) record.type = type;
		record.version++;
		state.ptr = record.pointer;
		state.type = record.type;
		state.pathHandleVersion = record.version;
		this.invalidateSoul(state);
	}

	static invalidate(state) {
		const record = this.record(state);
		if (!record) {
			this.invalidateSoul(state);
			return;
		}
		record.version++;
		state.pathHandleVersion = record.version;
		this.invalidateSoul(state);
	}

	static refresh(state) {
		const record = this.record(state);
		if (!record || state.pathHandleVersion === record.version) return false;
		state.ptr = record.pointer;
		state.type = record.type;
		state.pathHandleVersion = record.version;
		this.invalidateSoul(state);
		return true;
	}

	static record(state) {
		if (!state || !state.db) return null;
		const identity = state.pathHandleIdentity || this.identity(state);
		if (!identity) return null;
		state.pathHandleIdentity = identity;
		return this.book(state.db).get(identity) || null;
	}

	static identity(state) {
		if (!state || !state.db || !this.isLineageContext(state.context)) return null;
		const parts = [];
		let current = state;
		while (current && this.isLineageContext(current.context)) {
			parts.unshift(this.describeKey(current.context.key));
			const parent = require('./handle.js').getSoul(current.context.parent);
			if (!parent) return null;
			current = parent;
		}
		return JSON.stringify(parts);
	}

	static isLineageContext(context) {
		if (!context || typeof context !== 'object' || context instanceof Map) return false;
		return Object.prototype.hasOwnProperty.call(context, 'key')
			&& Object.prototype.hasOwnProperty.call(context, 'parent')
			&& Boolean(context.parent);
	}

	static describeKey(key) {
		if (typeof key === 'symbol') {
			return ['symbol', Symbol.keyFor(key) || key.description || String(key)];
		}
		return [typeof key, String(key)];
	}

	static book(database) {
		if (!books.has(database)) books.set(database, new Map());
		return books.get(database);
	}

	static invalidateSoul(state) {
		state.lastMutationCount = -1;
		state.lastParentPtrHash = null;
		state.actualOffset = undefined;
		state.actualLength = undefined;
		state.effectiveType = undefined;
		const common = state.writer && state.writer.common;
		if (!common) return;
		common.invalidateEngine();
		common._cachedStructPtrHash = null;
	}
}

module.exports = PathHandleBook;
