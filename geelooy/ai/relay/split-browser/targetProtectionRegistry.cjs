// B"H
// Boruch Hashem
// Blessed is He

const State = require("./targetProtectionState.cjs");

/**
 * @file Shares exact Chrome target leases across every browser closer in the process.
 * @description
 * The Awtsmoos gives one living target one protected name; Awtsmoos.com lets watchdog,
 * restored-tab purge, keeper cleanup, and direct close all consult the same witness.
 * A port-zero lease protects the launch interval before the final debug port is known.
 */
function protect(port, targetId, options = {}) {
	const id = clean(targetId);
	if (!id) {
		return false;
	}
	const state = State.portState(port);
	const ttlMs = Math.max(30000, Number(options.ttlMs || 15 * 60 * 1000));
	state.targets.set(id, {
		kind: clean(options.kind) || "leased",
		expiresAt: Date.now() + ttlMs
	});
	return true;
}

function releaseKind(kind = "") {
	for (const state of State.states()) {
		for (const [id, lease] of state.targets.entries()) {
			if (!kind || lease.kind === kind) {
				state.targets.delete(id);
			}
		}
	}
}

function releaseTarget(port, targetId) {
	const id = clean(targetId);
	const localRemoved = State.portState(port).targets.delete(id);
	const globalRemoved = State.portState(0).targets.delete(id);
	return localRemoved || globalRemoved;
}

function isProtected(port, targetId, now = Date.now()) {
	const id = clean(targetId);
	const localState = State.portState(port);
	const globalState = State.portState(0);
	State.expire(localState, now);
	State.expire(globalState, now);
	return localState.targets.has(id) || globalState.targets.has(id);
}

function filter(port, targets = []) {
	return targets.filter(target => {
		return !isProtected(port, target?.id);
	});
}

function suspend(port = 0) {
	if (!Number(port)) {
		return State.addGlobalSuspension();
	}
	const state = State.portState(port);
	state.suspensions += 1;
	return state.suspensions;
}

function resume(port = 0) {
	if (!Number(port)) {
		return State.removeGlobalSuspension();
	}
	const state = State.portState(port);
	state.suspensions = Math.max(0, state.suspensions - 1);
	return state.suspensions;
}

function isSuspended(port = 0) {
	return State.globalSuspensionCount() > 0 || State.portState(port).suspensions > 0;
}

function status(port = 0) {
	const localState = State.portState(port);
	const globalState = State.portState(0);
	State.expire(localState);
	State.expire(globalState);
	return {
		port: Number(port) || 0,
		protectedTargets: localState.targets.size,
		globalProtectedTargets: globalState.targets.size,
		portSuspensions: localState.suspensions,
		globalSuspensions: State.globalSuspensionCount()
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
