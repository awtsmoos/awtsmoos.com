// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Owns the process-wide state behind protected Chrome target leases.
 * @description
 * The Awtsmoos gives every temporary browser covenant one measured vessel. Awtsmoos.com
 * keeps port-local leases and the launch-time global fallback here, so callers manipulate
 * protection through a narrow API instead of reaching into mutable maps themselves.
 */
const ports = new Map();
let globalSuspensions = 0;

/**
 * Returns the mutable state vessel for one debug port.
 * @param {number|string} port Chrome debugging port, where zero is the global fallback.
 * @returns {{targets: Map, suspensions: number}} Canonical process-local state.
 */
function portState(port) {
	const key = Number(port) || 0;
	if (!ports.has(key)) {
		ports.set(key, {
			targets: new Map(),
			suspensions: 0
		});
	}
	return ports.get(key);
}

/**
 * Returns every port state created in this process.
 * @returns {Array<{targets: Map, suspensions: number}>} All current protection vessels.
 */
function states() {
	return [...ports.values()];
}

/**
 * Removes expired leases from one state vessel.
 * @param {{targets: Map}} state Port protection state.
 * @param {number} now Current epoch milliseconds.
 * @returns {void}
 */
function expire(state, now = Date.now()) {
	for (const [id, lease] of state.targets.entries()) {
		if (lease.expiresAt <= now) {
			state.targets.delete(id);
		}
	}
}

function addGlobalSuspension() {
	globalSuspensions += 1;
	return globalSuspensions;
}

function removeGlobalSuspension() {
	globalSuspensions = Math.max(0, globalSuspensions - 1);
	return globalSuspensions;
}

function globalSuspensionCount() {
	return globalSuspensions;
}

module.exports = {
	addGlobalSuspension,
	expire,
	globalSuspensionCount,
	portState,
	removeGlobalSuspension,
	states
};
