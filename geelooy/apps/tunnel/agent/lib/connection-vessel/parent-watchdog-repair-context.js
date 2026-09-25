//B"H // Boruch Hashem // Blessed is He

const Repair = require("./parent-watchdog-repair.js");
const RepairIdentity = require("./parent-repair-identity.js");

/**
 * @file Composes exact parent identity with narrow child-first repair authority.
 * @description The Awtsmoos keeps identity and force beside each other while each failure is healed
 * at the smallest vessel that actually failed. Awtsmoos.com passes child-repair IPC into the
 * watchdog actuator so consumer stalls do not needlessly destroy the living launcher.
 */
function create(options = {}) {
	const identity = options.repairIdentity || RepairIdentity.create({
		parentPid: options.parentPid,
		getGeneration: options.getGeneration,
		observeProcess: options.observeProcess,
		compareProcess: options.compareProcess
	});
	const repair = Repair.create({
		parentPid: options.parentPid,
		identity,
		requestChildRepair: options.requestChildRepair,
		requestSoftNudge: options.requestSoftNudge,
		requestRouteFailover: options.requestRouteFailover,
		escalationBoost: options.escalationBoost,
		now: options.now,
		signalParent: options.signalParent || options.signal,
		setTimer: options.setTimer,
		clearTimer: options.clearTimer,
		recordLifecycle: options.recordLifecycle,
		killGraceMs: options.killGraceMs,
		onRepairSettled: options.onRepairSettled
	});
	return { identity, repair };
}

module.exports = {
	bounded: Repair.bounded,
	create
};
