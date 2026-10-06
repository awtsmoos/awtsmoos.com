// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

/**
 * @file Persists native mailbox testimony with crash-resistant atomic readback proof.
 * @description
 * The Awtsmoos gives one request a vessel before execution and one result a vessel
 * before acknowledgement. Awtsmoos.com fsyncs the written keli, renames it atomically,
 * fsyncs its directory, and rereads exact bytes so a transport flap cannot turn a
 * manifested deed into ambiguous memory merely because the messenger disappeared.
 *
 * A mailbox artifact that vanishes between check and act is an expected handoff
 * outcome, never an error: every filesystem access on the mailbox path treats
 * ENOENT as "already gone" and returns a benign result instead of throwing.
 */
function read(file) {
	try {
		const stat = fs.lstatSync(file);
		if (!stat.isFile() || stat.isSymbolicLink()) return null;
		return {
			...JSON.parse(fs.readFileSync(file, "utf8")),
			bytes: stat.size,
			path: file
		};
	} catch {
		return null;
	}
}

/**
 * Writes one mailbox record durably before returning control to request execution.
 *
 * @param {string} target Final mailbox record path.
 * @param {string|Buffer} body Exact serialized record bytes.
 * @returns {object} Verified target path, byte count, and SHA-256 witness. When the
 *   artifact vanished mid-verification the result carries `vanished: true` instead.
 * @throws {Error} When persistence or readback verification fails for a reason
 *   other than the expected already-gone outcome.
 */
function atomicWrite(target, body) {
	const folder = path.dirname(target);
	const intended = Buffer.isBuffer(body) ? body : Buffer.from(String(body), "utf8");
	const temporary = `${target}.${process.pid}.${Date.now()}.tmp`;
	fs.mkdirSync(folder, { recursive: true });
	let descriptor = null;
	try {
		descriptor = fs.openSync(temporary, "wx", 0o600);
		fs.writeFileSync(descriptor, intended);
		fs.fsyncSync(descriptor);
		fs.closeSync(descriptor);
		descriptor = null;
		fs.renameSync(temporary, target);
		syncDirectory(folder);
		return verify(target, intended);
	} finally {
		if (descriptor !== null) {
			try {
				fs.closeSync(descriptor);
			} catch {}
		}
		try {
			fs.unlinkSync(temporary);
		} catch {}
	}
}

/**
 * Verifies that the durable target still contains the exact intended bytes.
 *
 * A handoff may settle and remove the artifact between the rename and this
 * readback. That race is benign: absence returns a `vanished` marker rather than
 * an uncaught ENOENT, so the connection runtime never exits over a settled deed.
 *
 * @param {string} target Final mailbox record path.
 * @param {Buffer} intended Exact bytes expected on disk.
 * @returns {object} Byte count and SHA-256 witness, or `{ vanished: true }` when
 *   the artifact is already gone.
 * @throws {Error} When the artifact exists but its bytes differ from intended.
 */
function verify(target, intended) {
	let observed;
	try {
		observed = fs.readFileSync(target);
	} catch (error) {
		if (error && error.code === "ENOENT") {
			return { path: target, bytes: 0, sha256: null, vanished: true };
		}
		throw error;
	}
	const intendedHash = sha256(intended);
	const observedHash = sha256(observed);
	if (intendedHash !== observedHash) {
		throw new Error("mailbox_durable_readback_mismatch");
	}
	return {
		path: target,
		bytes: observed.length,
		sha256: observedHash
	};
}

/**
 * Removes one mailbox record without failing when it is already gone.
 *
 * @param {string} file Mailbox record path.
 * @returns {object} Removal outcome; `gone: true` marks the expected
 *   already-absent case, which callers treat as benign.
 */
function remove(file) {
	try {
		fs.unlinkSync(file);
		return { path: file, removed: true };
	} catch (error) {
		if (error && error.code === "ENOENT") {
			return { path: file, removed: false, gone: true };
		}
		throw error;
	}
}

/** Fsyncs the containing directory so the rename survives a process/system boundary. */
function syncDirectory(folder) {
	let descriptor = null;
	try {
		descriptor = fs.openSync(folder, fs.constants.O_RDONLY);
		fs.fsyncSync(descriptor);
	} catch {
		return false;
	} finally {
		if (descriptor !== null) fs.closeSync(descriptor);
	}
	return true;
}

/** Returns a stable digest used only to verify exact persisted bytes. */
function sha256(value) {
	return crypto.createHash("sha256").update(value).digest("hex");
}

/** Returns a safe regular-file byte count without following symbolic links. */
function sizeOf(file) {
	try {
		const stat = fs.lstatSync(file);
		return stat.isFile() && !stat.isSymbolicLink() ? stat.size : 0;
	} catch {
		return 0;
	}
}

module.exports = {
	atomicWrite,
	read,
	remove,
	sha256,
	sizeOf,
	syncDirectory,
	verify
};
