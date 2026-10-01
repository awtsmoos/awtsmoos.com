// B"H
'use strict';

/**
 * @file pageIo.js
 * @description
 * Exact bytes cross the boundary without summoning the whole file. Each read
 * and write reveals only the pages required for this moment; the Awtsmoos is
 * no less whole because the vessel touches reality in measured fragments.
 */
module.exports = {
	readExact(offset, length) {
		if (!this.initialized) this.init();
		if (length <= 0) return Buffer.alloc(0);
		if (offset < 0 || offset + length > this.currentFileSize) return null;
		if (this.memory) {
			if (offset + length > this.memory.length) return null;
			return this.memory.subarray(offset, offset + length);
		}
		const output = Buffer.allocUnsafe(length);
		let copied = 0;
		while (copied < length) {
			const absolute = offset + copied;
			const page = this._loadPage(this._pageIndex(absolute));
			const pageOffset = absolute % this.pageSize;
			const take = Math.min(length - copied, this.pageSize - pageOffset);
			page.buf.copy(output, copied, pageOffset, pageOffset + take);
			copied += take;
		}
		return output;
	},

	writeExact(offset, buffer) {
		if (!this.initialized) this.init();
		if (!buffer || buffer.length === 0) return;
		this._recordWal(offset, buffer);
		if (this.memory) {
			const requiredEnd = offset + buffer.length;
			if (requiredEnd > this.memory.length) this._expandUniverse(requiredEnd);
			buffer.copy(this.memory, offset);
			this.currentFileSize = Math.max(this.currentFileSize, requiredEnd);
			this.dirty = true;
			return;
		}
		let copied = 0;
		while (copied < buffer.length) {
			const absolute = offset + copied;
			const pageIndex = this._pageIndex(absolute);
			const page = this._loadPage(pageIndex);
			const pageOffset = absolute % this.pageSize;
			const take = Math.min(buffer.length - copied, this.pageSize - pageOffset);
			buffer.copy(page.buf, pageOffset, copied, copied + take);
			page.dirty = true;
			this._rememberPage(pageIndex, page);
			copied += take;
		}
		this.currentFileSize = Math.max(this.currentFileSize, offset + buffer.length);
		this.dirty = true;
		this._pressureFlushDirtyPages();
		this._enforceCacheLimit();
	},

	_expandUniverse(minimumSize) {
		let newSize = Math.max(minimumSize, this.memory.length * 2, this.pageSize);
		newSize = (newSize + 4095) & ~4095;
		const largerMirror = Buffer.allocUnsafe(newSize).fill(0);
		this.memory.copy(largerMirror, 0, 0, this.memory.length);
		this.memory = largerMirror;
	}
};
