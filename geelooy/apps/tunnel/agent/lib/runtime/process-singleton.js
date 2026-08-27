// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const Owner = require("./process-singleton-owner.js");

const GLOBAL_KEY = Symbol.for("awtsmoos.agent.process.singleton.registry");
const LOCK_DIRECTORY = ".agent-instance.lock";

/**
 * @file Gives each install root one atomic agent-process lease.
 * @description
 * The Awtsmoos renews process and route without permitting two local bodies to
 * wrestle over one tunnel ID. Awtsmoos.com keys leases by resolved install root,
 * preserves initializing locks, and removes only the exact owner's directory.
 */
function acquire(root, options = {}) {
	const resolvedRoot = path.resolve(root);
	const registry = globalRegistry();
	if (registry.has(resolvedRoot)) return registry.get(resolvedRoot);
	const lockDirectory = path.join(resolvedRoot, LOCK_DIRECTORY);
	const token = crypto.randomUUID();
	const owner = Owner.create(token, options.now || Date.now);
	for (let attempt = 0; attempt < 4; attempt += 1) {
		const result = attemptAcquire(lockDirectory, owner, token, options);
		if (result.retry) continue;
		if (result.ok) registry.set(resolvedRoot, result);
		return result;
	}
	return { ok: false, error: "agent_instance_lock_contention" };
}

function attemptAcquire(lockDirectory, owner, token, options) {
	try {
		fs.mkdirSync(lockDirectory, { mode: 0o700 });
		Owner.write(lockDirectory, owner);
		return createHandle(lockDirectory, owner, options);
	} catch (error) {
		if (error.code !== "EEXIST") throw error;
		const existing = Owner.read(lockDirectory);
		if (existing?.pid === process.pid) {
			return createHandle(lockDirectory, existing, options);
		}
		if (!existing && Owner.initializing(lockDirectory)) {
			return { ok: false, error: "agent_instance_lock_initializing" };
		}
		if (Owner.alive(existing)) {
			return {
				ok: false,
				error: "agent_instance_already_running",
				owner: existing
			};
		}
		Owner.quarantine(lockDirectory, token);
		return { retry: true };
	}
}

function createHandle(lockDirectory, owner, options = {}) {
	let released = false;
	const resolvedRoot = path.dirname(lockDirectory);
	const timer = setInterval(() => heartbeat(lockDirectory, owner),
		Number(options.heartbeatMs || 5000));
	timer.unref?.();
	function release() {
		if (released) return;
		released = true;
		clearInterval(timer);
		if (Owner.read(lockDirectory)?.token === owner.token) {
			fs.rmSync(lockDirectory, { recursive: true, force: true });
		}
		globalRegistry().delete(resolvedRoot);
	}
	process.once("exit", release);
	return { ok: true, owner, lockDirectory, release };
}

function heartbeat(lockDirectory, owner) {
	owner.updatedAt = new Date().toISOString();
	try { Owner.write(lockDirectory, owner); } catch {}
}

function globalRegistry() {
	if (!globalThis[GLOBAL_KEY]) globalThis[GLOBAL_KEY] = new Map();
	return globalThis[GLOBAL_KEY];
}

module.exports = {
	GLOBAL_KEY,
	LOCK_DIRECTORY,
	acquire,
	globalRegistry
};
