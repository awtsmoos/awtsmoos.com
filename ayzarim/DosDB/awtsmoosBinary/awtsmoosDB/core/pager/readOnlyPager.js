// B"H

/**
 * @file core/pager/readOnlyPager.js
 * @chapter The Witness Touches Nothing And Therefore Testifies Clearly
 * @description
 * Opens the database with an operating-system read-only descriptor. It never
 * creates, replays, truncates, fsyncs, or clears a WAL and every write doorway
 * fails before a byte can approach the file.
 */

const fs = require('fs');

class ReadOnlyPager {
	constructor(filePath) {
		this.filePath = filePath;
		this.fd = null;
		this.db = null;
		this.initialized = false;
		this.currentFileSize = 0;
		this.fileSize = 0;
		this.pages = new Map();
		this.dirty = false;
		this.isBatching = false;
	}

	init() {
		if (this.initialized) return;
		try {
			this.fd = fs.openSync(this.filePath, 'r');
		} catch (error) {
			if (error && error.code === 'ENOENT') {
				const missing = new Error(`B"H readOnly AwtsmoosDB requires an existing file: ${this.filePath}`);
				missing.code = 'AWTSMOOS_DB_READONLY_MISSING';
				throw missing;
			}
			throw error;
		}
		this.currentFileSize = fs.fstatSync(this.fd).size;
		this.fileSize = this.currentFileSize;
		this.initialized = true;
	}

	readExact(offset, length) {
		if (!this.initialized) this.init();
		if (length <= 0) return Buffer.alloc(0);
		if (!Number.isSafeInteger(offset) || !Number.isSafeInteger(length)) return null;
		if (offset < 0 || offset + length > this.currentFileSize) return null;
		const output = Buffer.allocUnsafe(length);
		let position = 0;
		while (position < length) {
			const read = fs.readSync(this.fd, output, position, length - position, offset + position);
			if (read <= 0) return null;
			position += read;
		}
		return output;
	}

	writeExact() {
		throw this.readOnlyError('writeExact');
	}

	writeBufferedRange() {
		throw this.readOnlyError('writeBufferedRange');
	}

	readOnlyError(operation) {
		const error = new Error(`B"H strict read-only pager refused ${operation}`);
		error.code = 'AWTSMOOS_DB_READONLY_WRITE';
		return error;
	}

	logicalSize() {
		const cursor = Number(this.db?.allocator?.cursor || 0);
		return Number.isSafeInteger(cursor) && cursor > 0 ? cursor : this.currentFileSize;
	}

	memoryBytes() {
		return 0;
	}

	_flushWal() {
		return false;
	}

	fsync() {
		return true;
	}

	close() {
		if (this.fd !== null) fs.closeSync(this.fd);
		this.fd = null;
		this.initialized = false;
		this.pages.clear();
	}
}

module.exports = ReadOnlyPager;
