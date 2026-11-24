//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Atomic, conflict-detecting file writes.
 * @description Writes go to a sibling temp file and rename into place, so a
 * crash never leaves a half-written file. An expected-hash precondition
 * prevents silent overwrites when another agent edited the file first.
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

/** @param {string|Buffer} data @returns {string} sha256 hex digest. */
function hashOf(data) { return crypto.createHash("sha256").update(data).digest("hex"); }

/** @param {string} file @returns {string|null} Hash of current content, or null if absent. */
function currentHash(file) {
	try { return hashOf(fs.readFileSync(file)); } catch { return null; }
}

/**
 * Atomically writes `content` to `file`.
 * @param {string} file Destination path (already passed through pathGuard).
 * @param {string|Buffer} content New content.
 * @param {{expectedHash?:string|null, backup?:boolean, mode?:number}} [opts] expectedHash:
 * the hash the caller based its edit on; `null` means "file must not exist".
 * @returns {{ok:boolean, reason?:string, hash?:string, backup?:string}}
 */
function atomicWrite(file, content, opts = {}) {
	if (opts.expectedHash !== undefined) {
		const now = currentHash(file);
		if (now !== opts.expectedHash) {
			return { ok: false, reason: `hash conflict: expected ${opts.expectedHash}, found ${now}; re-read before writing` };
		}
	}
	const dir = path.dirname(file);
	fs.mkdirSync(dir, { recursive: true });
	let backup;
	if (opts.backup && fs.existsSync(file)) {
		backup = `${file}.bak-${Date.now()}`;
		fs.copyFileSync(file, backup);
	}
	const tmp = path.join(dir, `.awt-tmp-${process.pid}-${crypto.randomBytes(6).toString("hex")}`);
	try {
		fs.writeFileSync(tmp, content);
		const mode = fs.existsSync(file) ? fs.statSync(file).mode : (opts.mode || 0o644);
		fs.chmodSync(tmp, mode);
		fs.renameSync(tmp, file);
	} finally {
		try { fs.unlinkSync(tmp); } catch { /* already renamed away */ }
	}
	return { ok: true, hash: hashOf(content), backup };
}

module.exports = { hashOf, currentHash, atomicWrite };
