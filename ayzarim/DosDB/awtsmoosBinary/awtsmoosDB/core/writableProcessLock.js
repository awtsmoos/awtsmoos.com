// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const fs = require("node:fs");
const LockFiles = require("./processLock/lockFiles.js");
const Policy = require("./processLock/lockPolicy.js");

/**
 * @file Enforces one exclusive AwtsmoosDB engine per file, even inside one PID.
 * @description
 * The Awtsmoos is One while finite processes may host many independent engines.
 * Awtsmoos.com therefore grants custody to a unique lock-instance token, never to
 * a PID alone: two database objects in one Node process cannot silently diverge.
 */
class WritableProcessLock {
	constructor(databasePath) {
		this.dbPath = databasePath;
		this.files = new LockFiles(databasePath);
		this.filePath = this.files.exclusivePath;
		this.readerDir = this.files.readerDirectory;
		this.ownerToken = crypto.randomUUID();
		this.fd = null;
		this.owner = false;
		this.mode = null;
		this.readerPath = null;
	}

	/**
	 * Acquires one exclusive writer or shared reader marker within a bounded wait.
	 * Re-entry is permitted only through this exact lock object that already owns custody.
	 */
	acquire(options = {}) {
		if (options.processLock === false) return true;
		const mode = Policy.modeFromOptions(options);
		if (this.owner) return this.reenter(mode);
		const waitMs = Math.max(0, Number(options.lockWaitMs || 0));
		const startedAt = Date.now();

		while (true) {
			try {
				return mode === "shared"
					? this.acquireShared()
					: this.acquireExclusive();
			} catch (error) {
				const elapsedMs = Date.now() - startedAt;
				if (!Policy.isBusy(error) || elapsedMs >= waitMs) throw error;
				Policy.sleep(Policy.waitStep(waitMs - elapsedMs));
			}
		}
	}

	/** Releases only the sidecar still owned by this lock-instance token. */
	release() {
		if (this.fd !== null) {
			try {
				fs.closeSync(this.fd);
			} catch {}
			this.fd = null;
		}
		if (this.owner && this.mode === "exclusive") {
			this.files.removeExclusive(this.ownerToken);
		}
		if (this.owner && this.mode === "shared" && this.readerPath) {
			try {
				fs.rmSync(this.readerPath, { force: true });
			} catch {}
			this.files.removeReaderDirectoryIfEmpty();
		}
		this.owner = false;
		this.mode = null;
		this.readerPath = null;
	}

	/** Acquires exclusive custody; a live same-PID lock owned by another instance is busy. */
	acquireExclusive() {
		this.files.cleanStaleExclusive();
		try {
			this.fd = fs.openSync(this.filePath, "wx", 0o600);
			this.writeMetadata("exclusive");
			this.owner = true;
			this.mode = "exclusive";
			return true;
		} catch (error) {
			this.closeFailedDescriptor();
			if (error?.code !== "EEXIST") throw error;
			this.files.cleanStaleExclusive();
			if (!fs.existsSync(this.filePath)) return this.acquireExclusive();
			throw Policy.busy(`B"H: database already has an active exclusive writer: ${this.filePath}`);
		}
	}

	/** Acquires one unique shared-reader marker while preserving legacy reader/writer coexistence. */
	acquireShared() {
		this.files.cleanStaleExclusive();
		this.files.cleanStaleReaders();
		this.readerPath = this.files.readerPath(this.ownerToken);
		this.fd = fs.openSync(this.readerPath, "wx", 0o600);
		this.writeMetadata("shared");
		this.owner = true;
		this.mode = "shared";
		return true;
	}

	/** Allows only the exact owning lock object to repeat its already-held mode. */
	reenter(mode) {
		if (mode === this.mode) return true;
		throw Policy.busy("B\"H: one lock instance cannot change mode while it owns custody", "AWTSMOOS_DB_LOCK_MODE_CONFLICT");
	}

	/** Writes and fsyncs one ownership record before the lock is considered acquired. */
	writeMetadata(mode) {
		const body = JSON.stringify(Policy.metadata(this.dbPath, mode, this.ownerToken));
		fs.writeSync(this.fd, body);
		fs.fsyncSync(this.fd);
	}

	/** Closes a descriptor acquired before a failed metadata/write path. */
	closeFailedDescriptor() {
		if (this.fd === null) return;
		try {
			fs.closeSync(this.fd);
		} catch {}
		this.fd = null;
	}
}

module.exports = WritableProcessLock;
