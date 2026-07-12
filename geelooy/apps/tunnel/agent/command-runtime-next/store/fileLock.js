// B"H
const fs = require("node:fs/promises");

/**
 * B"H — A tiny lock file keeps two writers from describing different worlds in
 * one receipt. A dead owner's lock may be removed only after age and liveness
 * agree that its hand is gone.
 */
async function withFileLock(lockPath, operation, options = {}) {
	const timeoutMs = positive(options.timeoutMs, 5000);
	const staleMs = positive(options.staleMs, 30000);
	const pollMs = positive(options.pollMs, 20);
	const startedAt = Date.now();
	while (true) {
		const handle = await acquire(lockPath).catch(error => {
			if (error.code !== "EEXIST") throw error;
			return null;
		});
		if (handle) {
			try {
				return await operation();
			} finally {
				await handle.close().catch(() => {});
				await fs.rm(lockPath, { force: true }).catch(() => {});
			}
		}
		await clearStale(lockPath, staleMs);
		if (Date.now() - startedAt > timeoutMs) throw failure("command_store_lock_timeout");
		await sleep(pollMs);
	}
}

async function acquire(lockPath) {
	const handle = await fs.open(lockPath, "wx", 0o600);
	await handle.writeFile(JSON.stringify({ pid: process.pid, createdAt: Date.now() }));
	await handle.sync();
	return handle;
}

async function clearStale(lockPath, staleMs) {
	let record;
	try {
		record = JSON.parse(await fs.readFile(lockPath, "utf8"));
	} catch {
		return;
	}
	if (Date.now() - Number(record.createdAt || 0) <= staleMs) return;
	if (pidAlive(Number(record.pid || 0))) return;
	await fs.rm(lockPath, { force: true }).catch(() => {});
}

function pidAlive(pid) {
	if (!Number.isInteger(pid) || pid < 1) return false;
	try {
		process.kill(pid, 0);
		return true;
	} catch {
		return false;
	}
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? Math.floor(number) : fallback;
}

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

function failure(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}

module.exports = { clearStale, withFileLock };
