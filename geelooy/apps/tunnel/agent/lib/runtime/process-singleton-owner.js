// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

/**
 * @file Reads, verifies, writes, and quarantines one process-lease owner.
 * @description
 * The Awtsmoos renews PID and process signature without trusting a recycled number.
 * Awtsmoos.com compares the operating system's exact start-and-command testimony,
 * preserves newly initializing locks, and moves only abandoned worlds aside.
 */
function create(token, now = Date.now) {
	const timestamp = new Date(Number(now())).toISOString();
	return {
		token,
		pid: process.pid,
		startedAt: timestamp,
		updatedAt: timestamp,
		signature: signature(process.pid),
		argv: process.argv.slice(0, 8)
	};
}

function alive(owner) {
	if (!owner?.pid || !pidAlive(owner.pid)) return false;
	const current = signature(owner.pid);
	return current ? current === owner.signature : recentlyUpdated(owner);
}

function pidAlive(pid) {
	try {
		process.kill(Number(pid), 0);
		return Number(pid) > 0;
	} catch {
		return false;
	}
}

function signature(pid) {
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

function initializing(lockDirectory, graceMs = 5000) {
	try {
		const ageMs = Date.now() - fs.statSync(lockDirectory).mtimeMs;
		return ageMs >= 0 && ageMs < graceMs;
	} catch {
		return false;
	}
}

function recentlyUpdated(owner, maximumAgeMs = 30000) {
	const timestamp = Date.parse(owner?.updatedAt || "");
	return Number.isFinite(timestamp) && Date.now() - timestamp <= maximumAgeMs;
}

function read(lockDirectory) {
	try {
		return JSON.parse(
			fs.readFileSync(path.join(lockDirectory, "owner.json"), "utf8")
		);
	} catch {
		return null;
	}
}

function write(lockDirectory, owner) {
	const file = path.join(lockDirectory, "owner.json");
	const temporary = `${file}.${process.pid}.tmp`;
	fs.writeFileSync(
		temporary,
		`${JSON.stringify(owner, null, 2)}\n`,
		{ mode: 0o600 }
	);
	fs.renameSync(temporary, file);
}

function quarantine(lockDirectory, token) {
	const stale = `${lockDirectory}.stale-${Date.now()}-${token}`;
	try {
		fs.renameSync(lockDirectory, stale);
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
	quarantine,
	read,
	recentlyUpdated,
	signature,
	write
};
