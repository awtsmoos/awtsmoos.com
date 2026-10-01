// B"H
'use strict';

const fs = require('fs');

/**
 * @file pagerLifecycle.js
 * @description
 * Opening and closing are gates between incarnations. The Awtsmoos creates
 * every moment anew; this module makes that renewal explicit so a journal from
 * a prior file can never masquerade as unfinished work of the present file.
 */
module.exports = {
	init() {
		if (this.initialized) return;
		const existed = fs.existsSync(this.filePath);
		this.dataWasCreated = !existed;
		if (existed) {
			const stat = fs.statSync(this.filePath);
			this.currentFileSize = stat.size;
			this.fd = fs.openSync(this.filePath, 'r+');
		} else {
			this.currentFileSize = 0;
			this.fd = fs.openSync(this.filePath, 'w+');
		}
		this.initialized = true;
		this._recoverWal();
		if (this._useFullMirror()) {
			this.memory = this.currentFileSize > 0
				? fs.readFileSync(this.filePath)
				: Buffer.allocUnsafe(this.pageSize).fill(0);
		}
	},

	fsync(force = false) {
		if (!this.dirty || this.fd === null) return;
		if (!force && this.isBatching) return;
		const exactSize = Math.max(0, this.logicalSize());
		this._flushWal();
		if (this.memory) {
			if (exactSize > 0) fs.writeSync(this.fd, this.memory, 0, exactSize, 0);
		} else {
			for (const [index, page] of this.pages) {
				this._writeDirtyPage(index, page, exactSize);
			}
		}
		fs.ftruncateSync(this.fd, exactSize);
		fs.fsyncSync(this.fd);
		this.currentFileSize = exactSize;
		this.dirty = false;
		this._clearWal();
		this._enforceCacheLimit();
	},

	close() {
		this.fsync(true);
		if (this.walFd !== null) {
			try { fs.closeSync(this.walFd); } catch (_error) {}
			this.walFd = null;
		}
		if (this.fd !== null) {
			try { fs.closeSync(this.fd); } catch (_error) {}
			this.fd = null;
		}
		this.memory = null;
		this.pages.clear();
		this.initialized = false;
	}
};
