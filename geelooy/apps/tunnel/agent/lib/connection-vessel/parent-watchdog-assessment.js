// B"H
// Boruch Hashem
// Blessed is He

const ConsumerHealth = require("./parent-execution-health.js");
const Pressure = require("./parent-watchdog-pressure.js");
const Values = require("./parent-watchdog-values.js");

/**
 * @file Builds factual watchdog testimony before any repair policy is allowed to act.
 * @description
 * The Awtsmoos separates seeing from judging. Awtsmoos.com first measures custody,
 * parent pulse, consumer progress, control progress, and runtime pressure in one pure
 * assessment; only a later vessel may turn those facts into repair authority.
 */
function assess(options = {}) {
	const observedAt = Number(options.observedAt || Date.now());
	const mailbox = options.mailbox || {};
	const inbox = mailbox.inbox || {};
	const execution = ConsumerHealth.inspect(options.latestStats || {}, mailbox, {
		consumerStaleMs: options.consumerStaleMs,
		orphanRecovery: true,
		registered: options.registered === true,
		now: () => observedAt
	});
	const inspection = Values.inspection({
		registered: options.registered === true,
		unresolved: Values.nonnegative(inbox.count),
		acceptedAgeMs: Values.nonnegative(inbox.oldestAgeMs),
		backlogStaleMs: options.backlogStaleMs,
		parentAgeMs: Math.max(0, observedAt - Number(options.lastPulseAt || 0)),
		parentStaleMs: options.parentStaleMs,
		execution,
		controlStalled: options.controlHealth?.stalled === true
	});
	const pressure = Pressure.evidence(options.latestStats || {}, {
		graceMs: options.pressureGraceMs,
		lastPulseAt: options.lastPulseAt,
		now: observedAt
	});
	return { execution, inspection, pressure };
}

module.exports = { assess };
