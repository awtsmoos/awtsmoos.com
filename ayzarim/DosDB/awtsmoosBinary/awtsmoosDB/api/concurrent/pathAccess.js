// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file api/concurrent/pathAccess.js
 * @chapter The Logical Path Finds Its Parent Without Confusing The Scroll
 * @description
 * Centralizes synchronous path traversal, mutation, and deletion for concurrent
 * operations. LiveHandle writers receive optimized insertion hints while plain
 * JavaScript vessels retain ordinary assignment semantics. The Awtsmoos reveals
 * each parent once, so the public concurrency gate remains small and exact.
 */

const constants = require('../../constants.js');

class PathAccess {
	constructor(database, pathLocks) {
		this.db = database;
		this.pathLocks = pathLocks;
	}

	parts(path) {
		return this.pathLocks.parts(path);
	}

	get(path) {
		let cursor = this.db.root;
		for (const part of this.parts(path)) {
			if (cursor == null) return undefined;
			cursor = cursor[part];
		}
		return cursor;
	}

	parent(path) {
		const parts = this.parts(path);
		if (!parts.length) return null;
		let parent = this.db.root;
		for (let index = 0; index < parts.length - 1; index++) {
			const part = parts[index];
			if (parent[part] === undefined) parent[part] = {};
			parent = parent[part];
			if (parent == null) return null;
		}
		return { parent, key: parts[parts.length - 1] };
	}

	set(path, value) {
		const target = this.parent(path);
		if (!target) throw new Error('B"H: Cannot write the empty root path');
		const soul = target.parent && target.parent[constants.SYMBOLS.INTERNALS];
		if (soul && soul.writer && typeof soul.writer.set === 'function') {
			// B"H §8.2: the bulk path used to write with assumeNew +
			// skipFree + skipOldState, so every overwritten value was
			// left dead in the file and only the gated complement
			// refresh could rediscover it. The old value is now looked
			// up and freed through the ordinary release (which queues
			// into the retirement queue inside a batch). skipIndexes
			// stays: this path deliberately does not maintain the
			// search/vector indexes, and changing that is a separate
			// decision. Cost is one map seek per write — the bulk
			// publish caller already reads the existing post first.
			soul.writer.set(target.key, value, {
				skipIndexes: true
			});
			return value;
		}
		target.parent[target.key] = value;
		return value;
	}

	delete(path) {
		const target = this.parent(path);
		return target ? delete target.parent[target.key] : false;
	}
}

module.exports = PathAccess;
