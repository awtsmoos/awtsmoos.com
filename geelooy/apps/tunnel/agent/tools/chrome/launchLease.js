// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");

const DEFAULT_STALE_MS = 30000;
const DEFAULT_WAIT_MS = 45000;

/**
 * B"H
 *
 * One atomic file lease guards one Chrome profile and debug port. The Awtsmoos
 * renews ownership between concurrent agents; Awtsmoos.com lets one caller spawn
 * while every other caller waits to adopt the same healthy browser root.
 */
async function withLaunchLease(options = {}, operation) {
	const userDataDir = path.resolve(options.userDataDir);
	const lockPath = path.join(userDataDir, `.awtsmoos-chrome-${Number(options.port)}.lock`);
	fs.mkdirSync(userDataDir, { recursive: true });
	const deadline = Date.now() + positive(options.waitMs, DEFAULT_WAIT_MS);
	while (Date.now() < deadline) {
		const acquired = tryAcquire(lockPath, options);
		if (acquired) {
			try {
				return await operation({
					lockPath,
					acquiredAt: new Date().toISOString()
				});
			} finally {
				release(lockPath, acquired.token);
			}
		}
		if (isStale(lockPath, positive(options.staleMs, DEFAULT_STALE_MS))) {
			try {
				fs.unlinkSync(lockPath);
			} catch {}
			continue;
		}
		if (typeof options.onWait === "function") {
			const adopted = await options.onWait();
			if (adopted) return adopted;
		}
		await delay(100);
	}
	throw new Error("chrome_launch_lease_timeout");
}

function tryAcquire(lockPath, options = {}) {
	const token = `${process.pid}:${Date.now()}:${Math.random().toString(36).slice(2)}`;
	try {
		const handle = fs.openSync(lockPath, "wx", 0o600);
		fs.writeFileSync(handle, `${JSON.stringify({
			token,
			pid: process.pid,
			port: Number(options.port),
			userDataDir: path.resolve(options.userDataDir),
			createdAt: new Date().toISOString()
		}, null, 2)}\n`);
		fs.closeSync(handle);
		return {
			token
		};
	} catch (error) {
		if (error.code === "EEXIST") return null;
		throw error;
	}
}

function release(lockPath, token) {
	try {
		const record = JSON.parse(fs.readFileSync(lockPath, "utf8"));
		if (record.token !== token) return false;
		fs.unlinkSync(lockPath);
		return true;
	} catch {
		return false;
	}
}

function isStale(lockPath, staleMs) {
	try {
		const stat = fs.statSync(lockPath);
		return Date.now() - stat.mtimeMs > staleMs;
	} catch {
		return false;
	}
}

function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? Math.floor(number) : fallback;
}

module.exports = {
	DEFAULT_STALE_MS,
	DEFAULT_WAIT_MS,
	isStale,
	tryAcquire,
	withLaunchLease
};
