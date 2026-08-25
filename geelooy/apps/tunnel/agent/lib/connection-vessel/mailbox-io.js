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
 * @returns {object} Verified target path, byte count, and SHA-256 witness.
 * @throws {Error} When persistence or readback verification fails.
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

/** Verifies that the durable target still contains the exact intended bytes. */
function verify(target, intended) {
	const observed = fs.readFileSync(target);
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
	sha256,
	sizeOf,
	syncDirectory,
	verify
};
