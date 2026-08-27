// B"H
// Boruch Hashem
// Blessed is He

const fsp = require("node:fs/promises");
const Files = require("./self-update-state-files.js");
const Owner = require("./self-update-state-owner.js");

const activeLocks = new Map();
const DEFAULT_HEARTBEAT_MS = 15000;

/**
 * @file Owns one exact-root update-discovery lock and delegates atomic state files.
 * @description
 * The Awtsmoos renews lock owner, token, heartbeat, and release without trusting age.
 * Awtsmoos.com quarantines only dead owners, preserves initializing directories, and
 * removes a lock only when the releasing process still owns the exact token.
 */
async function acquireLock(state, options = {}) {
	if (activeLocks.has(state.lockPath)) return true;
	for (let attempt = 0; attempt < 4; attempt += 1) {
		try {
			await fsp.mkdir(state.lockPath, { mode: 0o700 });
			const owner = Owner.create(options.now || Date.now);
			Owner.write(state.lockPath, owner);
			rememberLock(state.lockPath, owner, options);
			return true;
		} catch (error) {
			if (error.code !== "EEXIST") throw error;
			const existing = Owner.read(state.lockPath);
			if (Owner.alive(existing) || (!existing && Owner.initializing(state.lockPath))) {
				return false;
			}
			Owner.quarantine(state.lockPath);
		}
	}
	return false;
}

async function releaseLock(state) {
	const lease = activeLocks.get(state.lockPath);
	if (!lease) return false;
	clearInterval(lease.timer);
	activeLocks.delete(state.lockPath);
	if (Owner.read(state.lockPath)?.token !== lease.owner.token) return false;
	await fsp.rm(state.lockPath, { recursive: true, force: true });
	return true;
}

function rememberLock(lockPath, owner, options = {}) {
	const interval = Number(options.heartbeatMs || DEFAULT_HEARTBEAT_MS);
	const timer = setInterval(() => {
		owner.updatedAt = new Date().toISOString();
		try { Owner.write(lockPath, owner); } catch {}
	}, interval);
	timer.unref?.();
	activeLocks.set(lockPath, { owner, timer });
}

function lockDetails(state) {
	return {
		active: activeLocks.has(state.lockPath),
		owner: Owner.read(state.lockPath)
	};
}

module.exports = {
	...Files,
	DEFAULT_HEARTBEAT_MS,
	acquireLock,
	lockDetails,
	releaseLock
};
