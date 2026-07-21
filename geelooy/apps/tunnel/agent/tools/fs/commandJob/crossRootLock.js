// B"H

const fs = require("node:fs/promises");
const path = require("node:path");

/** Creates one exclusive reconciliation lease inside an initialized state root. */
async function acquire(base, options = {}) {
	const lockPath = path.join(base, ".command-reconcile.lock");
	const staleMs = positive(options.lockStaleMs, 5 * 60 * 1000);
	await fs.mkdir(base, { recursive: true });
	try {
		await fs.writeFile(
			lockPath,
			`${JSON.stringify({ pid: process.pid, at: Date.now() })}\n`,
			{ flag: "wx", mode: 0o600 }
		);
		return { ok: true, lockPath };
	} catch (error) {
		if (error.code !== "EEXIST") throw error;
		const current = await read(lockPath);
		if (Date.now() - Number(current?.at || 0) <= staleMs) {
			return {
				ok: false,
				lockPath,
				reason: "reconciliation_locked",
				current
			};
		}
		await fs.rm(lockPath, { force: true });
		return acquire(base, options);
	}
}

async function release(lock = {}) {
	if (!lock.lockPath) return false;
	await fs.rm(lock.lockPath, { force: true }).catch(() => {});
	return true;
}

async function read(lockPath) {
	try {
		return JSON.parse(await fs.readFile(lockPath, "utf8"));
	} catch {
		return null;
	}
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0
		? Math.floor(number)
		: fallback;
}

module.exports = {
	acquire,
	read,
	release
};
