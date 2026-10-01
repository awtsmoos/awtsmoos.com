// B"H
'use strict';

const fs = require('fs');
const { CURRENT_HEADER_BYTES, currentHeader, inspectWalHeader } = require('./walHeader');

/**
 * @file walJournal.js
 * @description
 * A journal is a promise whispered before the page is changed: if the world
 * stops between intention and completion, the bytes may return—but only to the
 * same incarnation that made the promise. Old names do not inherit old debts.
 */
function truncateAndSync(fd) {
	fs.ftruncateSync(fd, 0);
	fs.fsyncSync(fd);
}

function replayRecords(pager, fd, size, position) {
	while (position + 12 <= size) {
		const recordHeader = Buffer.alloc(12);
		fs.readSync(fd, recordHeader, 0, recordHeader.length, position);
		position += recordHeader.length;
		const offset = Number(recordHeader.readBigUInt64BE(0));
		const length = recordHeader.readUInt32BE(8);
		if (position + length > size) break;
		const data = Buffer.alloc(length);
		if (length) fs.readSync(fd, data, 0, length, position);
		position += length;
		fs.writeSync(pager.fd, data, 0, data.length, offset);
		pager.currentFileSize = Math.max(pager.currentFileSize, offset + data.length);
	}
}

module.exports = {
	_recoverWal() {
		if (!this._useWal() || !fs.existsSync(this.walPath)) return;
		const stat = fs.statSync(this.walPath);
		if (!stat.size) return;
		const fd = fs.openSync(this.walPath, 'r+');
		try {
			const verdict = inspectWalHeader(fd, stat.size, this.fd, this.dataWasCreated);
			if (!verdict.replay) {
				truncateAndSync(fd);
				return;
			}
			this.recovering = true;
			replayRecords(this, fd, stat.size, verdict.offset);
			fs.fsyncSync(this.fd);
			truncateAndSync(fd);
		} finally {
			this.recovering = false;
			fs.closeSync(fd);
		}
	},

	_ensureWalOpen() {
		if (this.walFd !== null) return;
		this.walFd = fs.openSync(this.walPath, 'w+');
		const header = currentHeader(this.fd);
		fs.writeSync(this.walFd, header, 0, header.length, 0);
		this.walPosition = CURRENT_HEADER_BYTES;
		this.walActive = true;
	},

	_recordWal(offset, buffer) {
		if (this.recovering || !this._useWal() || !buffer || !buffer.length) return;
		this._ensureWalOpen();
		const header = Buffer.alloc(12);
		header.writeBigUInt64BE(BigInt(offset), 0);
		header.writeUInt32BE(buffer.length, 8);
		fs.writeSync(this.walFd, header, 0, header.length, this.walPosition);
		this.walPosition += header.length;
		fs.writeSync(this.walFd, buffer, 0, buffer.length, this.walPosition);
		this.walPosition += buffer.length;
	},

	_flushWal() {
		if (this._useWal() && this.walActive && this.walFd !== null) fs.fsyncSync(this.walFd);
	},

	_clearWal() {
		if (this.walFd !== null) {
			try { fs.closeSync(this.walFd); } catch (_error) {}
			this.walFd = null;
		}
		this.walPosition = 0;
		this.walActive = false;
		if (!this._useWal()) return;
		const fd = fs.openSync(this.walPath, 'w+');
		try { fs.ftruncateSync(fd, 0); } finally { fs.closeSync(fd); }
	},

	walBytes() {
		return this.walActive ? this.walPosition : 0;
	}
};
