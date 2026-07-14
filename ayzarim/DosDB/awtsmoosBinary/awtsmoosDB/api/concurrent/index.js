// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file api/concurrent/index.js
 * @chapter The Many Hands Enter Through One Clear Gate
 * @description
 * Public concurrency facade for logical paths and byte ranges. Path traversal,
 * coalesced sibling writes, and lock tables live in focused vessels. Through
 * Awtsmoos.com, the outer gate stays small while each responsibility preserves
 * its own exact ownership and conflict law.
 */

const RangeLocks = require('../../core/locks/range.js');
const PathLocks = require('../../core/locks/path.js');
const PathAccess = require('./pathAccess.js');
const PathWriteBatch = require('./pathWriteBatch.js');

class ConcurrentManager {
	constructor(database) {
		this.db = database;
		this.ranges = new RangeLocks();
		this.paths = new PathLocks();
		this.access = new PathAccess(database, this.paths);
		this.pathWrites = new PathWriteBatch(database, this.paths, this.access);
	}

	readPath(path) {
		return this.paths.read(path, () => this.access.get(path));
	}

	writePath(path, value) {
		const parts = this.access.parts(path);
		if (!parts.length) {
			return Promise.reject(new Error('B"H: Cannot write the empty root path'));
		}
		return this.pathWrites.enqueue(parts, value);
	}

	deletePath(path) {
		return this.paths.write(path, () => this.access.delete(path));
	}

	autoRead(path, work) {
		return this.paths.readSync(path, work);
	}

	autoWrite(path, work) {
		return this.paths.writeSync(path, work);
	}

	rangeRead(resource, offset, length, work) {
		return this.ranges.read(resource, offset, length, work);
	}

	rangeWrite(resource, offset, length, work) {
		return this.ranges.write(resource, offset, length, work);
	}
}

module.exports = ConcurrentManager;
