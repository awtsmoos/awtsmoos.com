// B"H
// Boruch Hashem
// Blessed is He

const Disk = require("./targetProtectionDisk.cjs");
const State = require("./targetProtectionState.cjs");

/**
 * @file Shares exact Chrome target leases across every Awtsmoos process on one host.
 * @description
 * The Awtsmoos joins fast in-memory witnesses with host-wide atomic lease files.
 * Awtsmoos.com therefore lets primary, rescue, workers, canaries, watchdogs, purges,
 * and intentional closers agree on which exact target generation may not be destroyed.
 */
function protect(port, targetId, options = {}) {
	const id = clean(targetId);
	if (!id) return false;
	const state = State.portState(port);
	const ttlMs = Math.max(30000, Number(options.ttlMs || 15 * 60 * 1000));
	state.targets.set(id, {
		kind: clean(options.kind) || "leased",
		expiresAt: Date.now() + ttlMs
	});
	Disk.protect(port, id, { ...options, ttlMs });
	return true;
}

function releaseKind(kind = "") {
	for (const state of State.states()) {
		for (const [id, lease] of state.targets.entries()) {
			if (!kind || lease.kind === kind) state.targets.delete(id);
		}
	}
	Disk.releaseKind(kind);
}

function releaseTarget(port, targetId) {
	const id = clean(targetId);
	const localRemoved = State.portState(port).targets.delete(id);
	const globalRemoved = State.portState(0).targets.delete(id);
	const diskRemoved = Disk.releaseTarget(port, id) > 0;
	return localRemoved || globalRemoved || diskRemoved;
}

function isProtected(port, targetId, now = Date.now()) {
	const id = clean(targetId);
	const localState = State.portState(port);
	const globalState = State.portState(0);
	State.expire(localState, now);
	State.expire(globalState, now);
	return localState.targets.has(id) ||
		globalState.targets.has(id) ||
		Disk.isProtected(port, id, now);
}

function filter(port, targets = []) {
	return targets.filter(target => !isProtected(port, target?.id));
}

function suspend(port = 0) {
	Disk.suspend(port);
	if (!Number(port)) return State.addGlobalSuspension();
	const state = State.portState(port);
	state.suspensions += 1;
	return state.suspensions;
}

function resume(port = 0) {
	Disk.resume(port);
	if (!Number(port)) return State.removeGlobalSuspension();
	const state = State.portState(port);
	state.suspensions = Math.max(0, state.suspensions - 1);
	return state.suspensions;
}

function isSuspended(port = 0) {
	return State.globalSuspensionCount() > 0 ||
		State.portState(port).suspensions > 0 ||
		Disk.isSuspended(port);
}

function status(port = 0) {
	const localState = State.portState(port);
	const globalState = State.portState(0);
	State.expire(localState);
	State.expire(globalState);
	const host = Disk.status(port);
	return {
		port: Number(port) || 0,
		protectedTargets: localState.targets.size,
		globalProtectedTargets: globalState.targets.size,
		hostProtectedTargets: host.protectedTargets,
		portSuspensions: localState.suspensions,
		globalSuspensions: State.globalSuspensionCount(),
		hostSuspensions: host.suspensions
	};
}

function clean(value) {
	return String(value || "").trim();
}

module.exports = {
	filter,
	isProtected,
	isSuspended,
	protect,
	releaseKind,
	releaseTarget,
	resume,
	status,
	suspend
};
