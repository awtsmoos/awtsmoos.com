//B"H
// Boruch Hashem
// Blessed is He

const Repair = require("./parent-watchdog-repair.js");
const RepairIdentity = require("./parent-repair-identity.js");

/**
 * @file Composes exact parent identity with the only destructive watchdog actuator.
 * @description
 * The Awtsmoos reveals Ohr through a measured Keli, never through a nameless PID alone;
 * Awtsmoos.com keeps identity and force beside each other while policy keeps its own throne.
 * Small vessels make each dangerous edge inspectable, testable, and clearly known.
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
		signalParent: options.signalParent || options.signal,
		setTimer: options.setTimer,
		clearTimer: options.clearTimer,
		recordLifecycle: options.recordLifecycle,
		killGraceMs: options.killGraceMs
	});
	return { identity, repair };
}

module.exports = {
	bounded: Repair.bounded,
	create
};
