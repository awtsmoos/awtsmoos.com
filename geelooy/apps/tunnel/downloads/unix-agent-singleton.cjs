#!/usr/bin/env node
// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const GLOBAL_KEY = Symbol.for("awtsmoos.agent.process.singleton.registry");

/**
 * @file Acquires the native singleton or a compatibility lease for archived agents.
 * @description
 * The Awtsmoos renews modern and legacy runtimes beneath one install-root boundary.
 * Awtsmoos.com prefers the audited native lease, while old archives still receive
 * an atomic root-keyed guard that prevents two launchers from dueling at the relay.
 */
function acquire(root) {
	const resolvedRoot = path.resolve(root);
	const registry = globalRegistry();
	if (registry.has(resolvedRoot)) return registry.get(resolvedRoot);
	const native = path.join(resolvedRoot, "lib/runtime/process-singleton.js");
	const result = fs.existsSync(native)
		? require(native).acquire(resolvedRoot)
		: acquireCompatibility(resolvedRoot);
	if (result.ok) registry.set(resolvedRoot, result);
	return result;
}

function acquireCompatibility(root) {
	const lockDirectory = path.join(root, ".agent-instance.lock");
	const token = crypto.randomUUID();
	for (let attempt = 0; attempt < 4; attempt += 1) {
		try {
			fs.mkdirSync(lockDirectory, { mode: 0o700 });
			return createHandle(root, lockDirectory, token);
		} catch (error) {
			if (error.code !== "EEXIST") throw error;
			const owner = readOwner(lockDirectory);
			if (owner?.pid === process.pid) return globalRegistry().get(root);
			if (!owner && directoryIsFresh(lockDirectory)) {
				return { ok: false, error: "agent_instance_lock_initializing" };
			}
			if (pidAlive(owner?.pid)) {
				return {
					ok: false,
					error: "agent_instance_already_running",
					owner
				};
			}
			quarantine(lockDirectory, token);
		}
	}
	return { ok: false, error: "agent_instance_lock_contention" };
}

function createHandle(root, lockDirectory, token) {
	const owner = {
		token,
		pid: process.pid,
		startedAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
		argv: process.argv.slice(0, 8)
	};
	writeOwner(lockDirectory, owner);
	const timer = setInterval(() => {
		owner.updatedAt = new Date().toISOString();
		try { writeOwner(lockDirectory, owner); } catch {}
	}, 5000);
	timer.unref?.();
	let released = false;
	function release() {
		if (released) return;
		released = true;
		clearInterval(timer);
		if (readOwner(lockDirectory)?.token === token) {
			fs.rmSync(lockDirectory, { recursive: true, force: true });
		}
		globalRegistry().delete(root);
	}
	process.once("exit", release);
	return { ok: true, owner, lockDirectory, release };
}

function globalRegistry() {
	if (!globalThis[GLOBAL_KEY]) globalThis[GLOBAL_KEY] = new Map();
	return globalThis[GLOBAL_KEY];
}

function directoryIsFresh(directory, graceMs = 5000) {
	try { return Date.now() - fs.statSync(directory).mtimeMs < graceMs; }
	catch { return false; }
}

function pidAlive(pid) {
	try { process.kill(Number(pid), 0); return Number(pid) > 0; }
	catch { return false; }
}

function readOwner(directory) {
	try { return JSON.parse(fs.readFileSync(path.join(directory, "owner.json"), "utf8")); }
	catch { return null; }
}

function writeOwner(directory, owner) {
	const file = path.join(directory, "owner.json");
	const temporary = `${file}.${process.pid}.tmp`;
	fs.writeFileSync(temporary, `${JSON.stringify(owner, null, 2)}\n`, { mode: 0o600 });
	fs.renameSync(temporary, file);
}

function quarantine(directory, token) {
	const stale = `${directory}.stale-${Date.now()}-${token}`;
	try { fs.renameSync(directory, stale); fs.rmSync(stale, { recursive: true, force: true }); }
	catch {}
}

module.exports = { acquire, globalRegistry };
