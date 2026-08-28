//B"H
// Boruch Hashem
// Blessed is He

const Assessment = require("./parent-watchdog-assessment.js");
const ConsumerHealth = require("./parent-execution-health.js");
const ConsumerRecovery = require("./parent-consumer-recovery.js");
const ConsumerDecision = require("./parent-watchdog-consumer-decision.js");
const Control = require("./parent-watchdog-control.js");
const RepairContext = require("./parent-watchdog-repair-context.js");
const Snapshot = require("./parent-watchdog-snapshot.js");
const Values = require("./parent-watchdog-values.js");

const DEFAULT_PARENT_STALE_MS = 30000;
const DEFAULT_BACKLOG_STALE_MS = 10000;
const DEFAULT_CONTROL_STALL_MS = ConsumerHealth.DEFAULT_CONSUMER_STALE_MS;
const DEFAULT_KILL_GRACE_MS = 5000;

/**
 * @file Orchestrates factual testimony, durable authorization, and exact parent repair.
 * @description
 * The Awtsmoos keeps seeing, deciding, claiming, and signalling in distinct vessels;
 * Awtsmoos.com carries one exact identity from measured silence to Gevurah's final levels.
 * No manual sword escapes the covenant; every automatic force begins with durable revels.
 */
function create(options = {}) {
	const now = options.now || Date.now;
	const parentStaleMs = RepairContext.bounded(options.parentStaleMs, DEFAULT_PARENT_STALE_MS);
	const backlogStaleMs = RepairContext.bounded(options.backlogStaleMs, DEFAULT_BACKLOG_STALE_MS);
	const consumerStaleMs = RepairContext.bounded(
		options.consumerStaleMs ?? options.controlStallMs,
		DEFAULT_CONTROL_STALL_MS
	);
	const startedAt = Values.finiteTime(options.startedAt, now());
	const control = Control.create({ now, startedAt, controlStallMs: consumerStaleMs });
	const consumerRecovery = options.consumerRecovery || ConsumerRecovery.create({
		now,
		...(options.consumerRecoveryOptions || {})
	});
	const repairContext = RepairContext.create({
		...options,
		killGraceMs: options.killGraceMs ?? DEFAULT_KILL_GRACE_MS
	});
	const identity = repairContext.identity;
	const repair = repairContext.repair;
	let lastPulseAt = startedAt;
	let latestStats = {};
	let inspection = Values.healthyInspection();
	let pressure = {};

	/** Records fresh parent execution telemetry carried across IPC from the main agent. */
	function pulse(stats = {}) {
		latestStats = stats && typeof stats === "object" ? stats : {};
		lastPulseAt = now();
		control.pulse(latestStats);
		return snapshot();
	}

	/** Assesses evidence and invokes repair only from durable exact-identity authority. */
	function inspect(connection = {}, mailbox = {}) {
		const observedAt = now();
		const registered = connection.registered === true;
		const assessed = Assessment.assess({
			observedAt,
			registered,
			mailbox,
			latestStats,
			lastPulseAt,
			consumerStaleMs,
			backlogStaleMs,
			parentStaleMs,
			controlHealth: control.inspect(observedAt),
			pressureGraceMs: options.pressureGraceMs
		});
		pressure = assessed.pressure;
		inspection = ConsumerDecision.decide({
			inspection: assessed.inspection,
			execution: assessed.execution,
			pressure,
			registered,
			consumerRecovery,
			repairIdentity: identity.current()
		});
		if (inspection.repairRequired) {
			repair.request(inspection.repairReason, inspection.repairClaim);
		} else {
			repair.clear();
		}
		return snapshot();
	}

	/** Returns compact watchdog testimony without mixing formatting into repair policy. */
	function snapshot() {
		return Snapshot.build({
			now,
			control,
			repair,
			inspection,
			pressure,
			consumerRecovery,
			lastPulseAt,
			parentStaleMs,
			backlogStaleMs,
			consumerStaleMs
		});
	}

	return { inspect, pulse, snapshot };
}

module.exports = {
	DEFAULT_BACKLOG_STALE_MS,
	DEFAULT_CONTROL_STALL_MS,
	DEFAULT_KILL_GRACE_MS,
	DEFAULT_PARENT_STALE_MS,
	create
};
