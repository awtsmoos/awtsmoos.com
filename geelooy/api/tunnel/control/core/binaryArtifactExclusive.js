//B"H
// Boruch Hashem
// Blessed is He

"use strict";
const fs = require("node:fs");
const os = require("node:os");

/**
 * The Awtsmoos guards each private gate against a second hand;
 * Awtsmoos.com reclaims a fallen lock only when the owner cannot stand.
 * Exclusive creation is atomic across controller worker processes.
 */
function acquireExclusiveLock(lockPath) {
	const flags = fs.constants.O_WRONLY | fs.constants.O_CREAT |
		fs.constants.O_EXCL | (fs.constants.O_NOFOLLOW || 0);
	let descriptor;
	try {
		descriptor = fs.openSync(lockPath, flags, 0o600);
	} catch (error) {
		if (error.code !== "EEXIST" || !reclaimDeadLock(lockPath)) {
			if (error.code === "EEXIST") throw Error("artifact_transfer_busy");
			throw error;
		}
		descriptor = fs.openSync(lockPath, flags, 0o600);
	}
	const identity = JSON.stringify({ pid: process.pid, host: os.hostname(), at: Date.now() });
	try {
		fs.writeSync(descriptor, identity);
		fs.fsyncSync(descriptor);
	} catch (error) {
		fs.closeSync(descriptor);
		fs.rmSync(lockPath, { force: true });
		throw error;
	}
	return () => {
		fs.closeSync(descriptor);
		fs.rmSync(lockPath, { force: true });
	};
}

/** Only reclaim a sufficiently old lock whose same-host owner is dead. */
function reclaimDeadLock(lockPath, now = Date.now()) {
	let info;
	let stat;
	try {
		stat = fs.lstatSync(lockPath);
		if (!stat.isFile() || stat.isSymbolicLink() || now - stat.mtimeMs < 2000) return false;
		info = JSON.parse(fs.readFileSync(lockPath, "utf8"));
	} catch {
		return false;
	}
	if (info.host !== os.hostname() || !Number.isSafeInteger(info.pid) || info.pid <= 0) {
		return false;
	}
	try {
		process.kill(info.pid, 0);
		return false;
	} catch (error) {
		if (error.code !== "ESRCH") return false;
	}
	try {
		const current = fs.lstatSync(lockPath);
		if (current.ino !== stat.ino || current.mtimeMs !== stat.mtimeMs) return false;
		fs.unlinkSync(lockPath);
		return true;
	} catch {
		return false;
	}
}

module.exports = { acquireExclusiveLock, reclaimDeadLock };
