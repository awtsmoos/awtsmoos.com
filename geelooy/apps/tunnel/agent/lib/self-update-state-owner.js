// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

/**
 * @file Verifies one self-update lock owner without trusting age or recycled PID.
 * @description
 * The Awtsmoos renews process number, start signature, token, and heartbeat together.
 * Awtsmoos.com refuses to steal a live lock merely because time passed, while stale
 * or malformed locks move aside atomically before a new owner may be written.
 */
function create(now = Date.now) {
	const timestamp = new Date(Number(now())).toISOString();
	return {
		token: crypto.randomUUID(),
		pid: process.pid,
		startedAt: timestamp,
		updatedAt: timestamp,
		signature: processSignature(process.pid)
	};
}

function read(lockPath) {
	try {
		const stat = fs.lstatSync(lockPath);
		if (stat.isDirectory()) {
			return JSON.parse(
				fs.readFileSync(path.join(lockPath, "owner.json"), "utf8")
			);
		}
		const [pid, timestamp] = fs.readFileSync(lockPath, "utf8").trim().split(/\s+/);
		return {
			legacy: true,
			pid: Number(pid || 0),
			updatedAt: new Date(Number(timestamp || 0)).toISOString(),
			signature: processSignature(Number(pid || 0))
		};
	} catch {
		return null;
	}
}

function write(lockPath, owner) {
	const file = path.join(lockPath, "owner.json");
	const temporary = `${file}.${process.pid}.tmp`;
	fs.writeFileSync(temporary, `${JSON.stringify(owner, null, 2)}\n`, {
		mode: 0o600
	});
	fs.renameSync(temporary, file);
}

function alive(owner = {}) {
	if (!owner.pid || !pidAlive(owner.pid)) return false;
	if (owner.legacy) return true;
	const current = processSignature(owner.pid);
	return current ? current === owner.signature : recent(owner);
}

function pidAlive(pid) {
	try {
		process.kill(Number(pid), 0);
		return Number(pid) > 0;
	} catch {
		return false;
	}
}

function processSignature(pid) {
	if (!Number(pid)) return "";
	try {
		return execFileSync(
			"ps",
			["-p", String(pid), "-o", "lstart=", "-o", "command="],
			{ encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }
		).trim().slice(0, 2000);
	} catch {
		return "";
	}
}

function initializing(lockPath, graceMs = 5000) {
	try {
		return Date.now() - fs.lstatSync(lockPath).mtimeMs < graceMs;
	} catch {
		return false;
	}
}

function recent(owner, maximumAgeMs = 30000) {
	const timestamp = Date.parse(owner.updatedAt || "");
	return Number.isFinite(timestamp) && Date.now() - timestamp <= maximumAgeMs;
}

function quarantine(lockPath, token = crypto.randomUUID()) {
	const stale = `${lockPath}.stale-${Date.now()}-${token}`;
	try {
		fs.renameSync(lockPath, stale);
		fs.rmSync(stale, { recursive: true, force: true });
		return true;
	} catch {
		return false;
	}
}

module.exports = {
	alive,
	create,
	initializing,
	pidAlive,
	processSignature,
	quarantine,
	read,
	recent,
	write
};
