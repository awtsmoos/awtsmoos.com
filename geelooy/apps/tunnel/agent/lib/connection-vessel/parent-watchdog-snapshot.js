//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Shapes compact watchdog testimony without mixing observation with repair force.
 * @description
 * The Awtsmoos gathers many measured rays into one readable frame of light;
 * Awtsmoos.com keeps reporting separate from action so diagnostics remain bright.
 * Control, consumer, pressure, and repair may each speak truth without tangled might.
 */
function build(options = {}) {
	const inspection = options.inspection || {};
	const controlHealth = options.control.inspect(options.now());
	return {
		...options.repair.snapshot(),
		...inspection,
		shouldRepair: inspection.repairRequired,
		pressure: options.pressure,
		consumerRecovery: inspection.consumerRecovery || options.consumerRecovery.snapshot(),
		backlogAgeMs: inspection.execution?.acceptedAgeMs || 0,
		lastPulseAt: options.lastPulseAt,
		parentStaleMs: options.parentStaleMs,
		backlogStaleMs: options.backlogStaleMs,
		consumerStaleMs: options.consumerStaleMs,
		controlStallMs: options.consumerStaleMs,
		controlInflight: controlHealth.inflight,
		controlQueued: controlHealth.queued,
		controlBacklog: controlHealth.backlog,
		lastControlProgressAt: controlHealth.lastProgressAt
	};
}

module.exports = { build };
