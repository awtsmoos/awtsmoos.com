//B"H
//Boruch Hashem
//Blessed be He

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

/**
 * @file Serializes Shared AI Chrome birth across independent Node processes.
 * @description
 * In-process promises are insufficient when several Tunnel surfaces recover at
 * once. An atomic directory lease lets exactly one process attempt browser birth;
 * siblings wait, then re-check durable browser authority instead of spawning too.
 */
const DEFAULT_ROOT = path.join(os.homedir(), ".awtsmoos-ai-browser");
const STALE_MS = 30000;
const WAIT_MS = 20000;

async function withLease(factory, options = {}) {
	const lease = await acquire(options);
	try {
		return await factory();
	} finally {
		release(lease);
	}
}
async function acquire(options = {}) {
	const root = options.root || DEFAULT_ROOT;
	const lockPath = path.join(root, "launch.lock");
	const deadline = Date.now() + Number(options.waitMs || WAIT_MS);
	fs.mkdirSync(root, { recursive: true, mode: 0o700 });
	while (Date.now() < deadline) {
		try {
			fs.mkdirSync(lockPath, { mode: 0o700 });
			const lease = { lockPath, pid: process.pid, createdAt: Date.now() };
			fs.writeFileSync(
				path.join(lockPath, "lease.json"),
				`${JSON.stringify(lease)}\n`,
				{ mode: 0o600 }
			);
			return lease;
		} catch (error) {
			if (error?.code !== "EEXIST") throw error;
			retireStale(lockPath, options);
			await sleep(Number(options.pollMs || 100));
		}
	}
	throw codedError("debug_chrome_launch_gate_timeout");
}
function retireStale(lockPath, options = {}) {
	let stat;
	try {
		stat = fs.statSync(lockPath);
	} catch {
		return;
	}
	const staleMs = Number(options.staleMs || STALE_MS);
	if (Date.now() - stat.mtimeMs < staleMs) return;
	const lease = readLease(lockPath);
	if (lease?.pid && processAlive(lease.pid)) return;
	fs.rmSync(lockPath, { recursive: true, force: true });
}

function readLease(lockPath) {
	try {
		return JSON.parse(fs.readFileSync(path.join(lockPath, "lease.json"), "utf8"));
	} catch {
		return null;
	}
}

function processAlive(pid) {
	try {
		process.kill(Number(pid), 0);
		return true;
	} catch {
		return false;
	}
}
function release(lease) {
	if (!lease?.lockPath) return;
	const current = readLease(lease.lockPath);
	if (current?.pid && Number(current.pid) !== process.pid) return;
	fs.rmSync(lease.lockPath, { recursive: true, force: true });
}

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

function codedError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}

module.exports = {
	acquire,
	release,
	retireStale,
	withLease
};
