// B"H
'use strict';

const fs = require('fs');

/**
 * @file pageCache.js
 * @description
 * Pages rise into memory only when called, then return to obscurity when their
 * task is done. The Awtsmoos remains present equally in the remembered page
 * and the evicted one; bounded memory is therefore not absence, only order.
 */
module.exports = {
	_pageIndex(offset) {
		return Math.floor(offset / this.pageSize);
	},

	_rememberPage(index, page) {
		if (this.pages.has(index)) this.pages.delete(index);
		this.pages.set(index, page);
		return page;
	},

	_loadPage(index) {
		let page = this.pages.get(index);
		if (page) return this._rememberPage(index, page);
		const buffer = Buffer.allocUnsafe(this.pageSize).fill(0);
		const start = index * this.pageSize;
		if (start < this.currentFileSize) {
			const maximum = Math.min(this.pageSize, this.currentFileSize - start);
			fs.readSync(this.fd, buffer, 0, maximum, start);
		}
		page = this._rememberPage(index, { buf: buffer, dirty: false });
		this._enforceCacheLimit();
		return page;
	},

	_dirtyPageCount() {
		let count = 0;
		for (const page of this.pages.values()) if (page.dirty) count += 1;
		return count;
	},

	_writeDirtyPage(index, page, exactSize) {
		if (!page || !page.dirty || this.fd === null) return false;
		const start = index * this.pageSize;
		if (start >= exactSize) {
			page.dirty = false;
			return true;
		}
		const length = Math.min(this.pageSize, exactSize - start);
		if (length > 0) fs.writeSync(this.fd, page.buf, 0, length, start);
		page.dirty = false;
		return true;
	},

	_pressureFlushDirtyPages() {
		if (this.memory || this.fd === null) return;
		const threshold = this._dirtyFlushThreshold();
		let dirtyCount = this._dirtyPageCount();
		if (dirtyCount <= threshold) return;
		const exactSize = Math.max(0, this.logicalSize());
		if (this._useWal()) this._flushWal();
		for (const [index, page] of this.pages) {
			if (dirtyCount <= threshold) break;
			if (!page.dirty) continue;
			if (this._writeDirtyPage(index, page, exactSize)) dirtyCount -= 1;
		}
		this.dirty = this._dirtyPageCount() > 0;
	},

	_enforceCacheLimit() {
		if (this.memory) return;
		const maximumPages = this._maxCachedPages();
		if (this.pages.size <= maximumPages) return;
		this._evictCleanPages(maximumPages);
		if (this.pages.size <= maximumPages) return;
		this._pressureFlushDirtyPages();
		this._evictCleanPages(maximumPages);
	},

	_evictCleanPages(maximumPages) {
		for (const [index, page] of this.pages) {
			if (this.pages.size <= maximumPages) return;
			if (page.dirty) continue;
			this.pages.delete(index);
		}
	}
};
