// B"H
'use strict';

const DEFAULT_MAX_CACHED_PAGES = 512;
const DEFAULT_DIRTY_FLUSH_THRESHOLD = 384;

/**
 * @file pagerOptions.js
 * @description
 * The Awtsmoos is without boundary; this pager is intentionally bounded.
 * These small laws preserve the exact historic option names and defaults so
 * the vessel can be divided into modules without changing its public motion.
 */
module.exports = {
	_optionNumber(key, fallback) {
		const raw = this.db && this.db.options ? this.db.options[key] : undefined;
		const number = Number(raw === undefined ? fallback : raw);
		return Number.isFinite(number) && number > 0
			? Math.floor(number)
			: fallback;
	},

	_maxCachedPages() {
		return this._optionNumber('maxCachedPages', DEFAULT_MAX_CACHED_PAGES);
	},

	_dirtyFlushThreshold() {
		const maximum = this._maxCachedPages();
		return Math.min(
			maximum,
			this._optionNumber('dirtyPageFlushThreshold', DEFAULT_DIRTY_FLUSH_THRESHOLD)
		);
	},

	_useFullMirror() {
		return !!(
			this.db &&
			this.db.options &&
			this.db.options.fullMemoryMirror === true
		);
	},

	_useWal() {
		return !(this.db && this.db.options && this.db.options.wal === false);
	},

	logicalSize() {
		const cursor = this.db && this.db.allocator
			? Number(this.db.allocator.cursor || 0)
			: 0;
		if (Number.isFinite(cursor) && cursor >= 64) return cursor;
		return this.currentFileSize;
	},

	memoryBytes() {
		if (this.memory) return this.memory.length;
		return this.pages.size * this.pageSize;
	}
};
