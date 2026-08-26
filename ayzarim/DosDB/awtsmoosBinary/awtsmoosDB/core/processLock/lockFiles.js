// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");

/**
 * @file Owns filesystem testimony for database writer and shared-reader locks.
 * @description
 * The Awtsmoos gives every finite lock a visible vessel; Awtsmoos.com reads that
 * vessel conservatively, sweeps only owners whose PID is truly gone, and never lets
 * one database instance delete another living owner's gate merely because PIDs match.
 */
class LockFiles {
	constructor(databasePath) {
		this.databasePath = databasePath;
		this.exclusivePath = `${databasePath}.lock`;
		this.readerDirectory = `${databasePath}.readers`;
	}

	/** Reads lock metadata without throwing when a stale or partial file is encountered. */
	readMetadata(lockPath) {
		try {
			return JSON.parse(fs.readFileSync(lockPath, "utf8"));
		} catch {
			return {};
		}
	}

	/** Returns whether the operating system still recognizes one owning PID. */
	isProcessAlive(pid) {
		const number = Number(pid || 0);
		if (!number) return false;
		try {
			process.kill(number, 0);
			return true;
		} catch (error) {
			if (error?.code === "ESRCH") return false;
			if (error?.code === "EPERM") return true;
			return false;
		}
	}

	/** Removes an exclusive lock only when its recorded process is no longer alive. */
	cleanStaleExclusive() {
		if (!fs.existsSync(this.exclusivePath)) return false;
		const metadata = this.readMetadata(this.exclusivePath);
		if (this.isProcessAlive(metadata.pid)) return false;
		try {
			fs.rmSync(this.exclusivePath, { force: true });
			return true;
		} catch {
			return false;
		}
	}

	/** Removes dead shared-reader markers and prunes an empty marker directory. */
	cleanStaleReaders() {
		for (const entry of this.readerEntries()) {
			if (this.isProcessAlive(entry.metadata.pid)) continue;
			try {
				fs.rmSync(entry.path, { force: true });
			} catch {}
		}
		this.removeReaderDirectoryIfEmpty();
	}

	/** Returns live and stale reader marker metadata for diagnostics and cleanup. */
	readerEntries() {
		let entries;
		try {
			entries = fs.readdirSync(this.readerDirectory, { withFileTypes: true });
		} catch {
			return [];
		}
		return entries
			.filter(entry => entry.isFile())
			.map(entry => {
				const filePath = path.join(this.readerDirectory, entry.name);
				return { path: filePath, metadata: this.readMetadata(filePath) };
			});
	}

	/** Removes an exclusive lock only when the caller's instance token still owns it. */
	removeExclusive(ownerToken) {
		const metadata = this.readMetadata(this.exclusivePath);
		if (!metadata.ownerToken || metadata.ownerToken !== ownerToken) return false;
		try {
			fs.rmSync(this.exclusivePath, { force: true });
			return true;
		} catch {
			return false;
		}
	}

	/** Creates one unique shared-reader marker path for this lock instance. */
	readerPath(ownerToken) {
		fs.mkdirSync(this.readerDirectory, { recursive: true });
		const safePid = String(process.pid).replace(/[^0-9]/g, "");
		const safeToken = String(ownerToken).replace(/[^a-zA-Z0-9_-]/g, "");
		return path.join(this.readerDirectory, `${safePid}-${safeToken}.lock`);
	}

	/** Removes the marker directory only after its final reader has gone. */
	removeReaderDirectoryIfEmpty() {
		try {
			fs.rmdirSync(this.readerDirectory);
		} catch {}
	}
}

module.exports = LockFiles;
