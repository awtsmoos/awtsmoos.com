// B"H

/**
 * @file core/processLock.js
 * @chapter The Read-Only Witness Leaves No Footprint At The Gate
 * @description
 * Keeps the established writer/shared lock implementation intact for writable
 * sessions while strict read-only sessions create no lock file or reader marker.
 */

const WritableProcessLock = require('./writableProcessLock.js');

class ProcessLockFacade {
	constructor(filePath) {
		this.dbPath = filePath;
		this.filePath = `${filePath}.lock`;
		this.readerDir = `${filePath}.readers`;
		this.mode = null;
		this.owner = false;
		this.fd = null;
		this.inner = new WritableProcessLock(filePath);
	}

	acquire(options = {}) {
		if (options.readOnly === true) {
			this.mode = 'strict-read-only-no-sidecar';
			this.owner = false;
			this.fd = null;
			return true;
		}
		const acquired = this.inner.acquire(options);
		this.syncFromInner();
		return acquired;
	}

	release() {
		if (this.mode === 'strict-read-only-no-sidecar') {
			this.mode = null;
			return;
		}
		this.inner.release();
		this.syncFromInner();
	}

	syncFromInner() {
		this.mode = this.inner.mode;
		this.owner = this.inner.owner;
		this.fd = this.inner.fd;
	}
}

module.exports = ProcessLockFacade;
