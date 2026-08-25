// B"H
// Boruch Hashem
// Blessed is He

const Assessment = require("./parent-watchdog-assessment.js");
const ConsumerHealth = require("./parent-execution-health.js");
const ConsumerRecovery = require("./parent-consumer-recovery.js");
const ConsumerDecision = require("./parent-watchdog-consumer-decision.js");
const Control = require("./parent-watchdog-control.js");
const Repair = require("./parent-watchdog-repair.js");
const Values = require("./parent-watchdog-values.js");

const DEFAULT_PARENT_STALE_MS = 30000;
const DEFAULT_BACKLOG_STALE_MS = 10000;
const DEFAULT_CONTROL_STALL_MS = ConsumerHealth.DEFAULT_CONSUMER_STALE_MS;
const DEFAULT_KILL_GRACE_MS = 5000;

/**
 * @file Orchestrates independent parent testimony and exact generation repair.
 * @description
 * The Awtsmoos keeps seeing, deciding, and signalling in distinct vessels.
 * Awtsmoos.com lets factual assessment remain pure, consumer recovery earn its own
 * durable claim, and only the final orchestration layer touch the exact parent PID.
 */
function create(options = {}) {
	const now = options.now || Date.now;
	const parentStaleMs = Repair.bounded(options.parentStaleMs, DEFAULT_PARENT_STALE_MS);
	const backlogStaleMs = Repair.bounded(options.backlogStaleMs, DEFAULT_BACKLOG_STALE_MS);
	const consumerStaleMs = Repair.bounded(
		options.consumerStaleMs ?? options.controlStallMs,
		DEFAULT_CONTROL_STALL_MS
	);
	const startedAt = Values.finiteTime(options.startedAt, now());
	const control = Control.create({ now, startedAt, controlStallMs: consumerStaleMs });
	const consumerRecovery = options.consumerRecovery || ConsumerRecovery.create({
		now,
		...(options.consumerRecoveryOptions || {})
	});
	const repair = Repair.create({
		parentPid: options.parentPid,
		signalParent: options.signalParent || options.signal,
		setTimer: options.setTimer,
		recordLifecycle: options.recordLifecycle,
		killGraceMs: options.killGraceMs ?? DEFAULT_KILL_GRACE_MS
	});
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

	/** Assesses custody/progress, applies bounded recovery policy, and invokes one exact repair. */
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
			consumerRecovery
		});
		if (inspection.repairRequired) repair.request(inspection.repairReason);
		else repair.clear();
		return snapshot();
	}

	/** Returns compact watchdog testimony for child publication and diagnostics. */
	function snapshot() {
		const controlHealth = control.inspect(now());
		return {
			...repair.snapshot(),
			...inspection,
			shouldRepair: inspection.repairRequired,
			pressure,
			consumerRecovery: inspection.consumerRecovery || consumerRecovery.snapshot(),
			backlogAgeMs: inspection.execution?.acceptedAgeMs || 0,
			lastPulseAt,
			parentStaleMs,
			backlogStaleMs,
			consumerStaleMs,
			controlStallMs: consumerStaleMs,
			controlInflight: controlHealth.inflight,
			controlQueued: controlHealth.queued,
			controlBacklog: controlHealth.backlog,
			lastControlProgressAt: controlHealth.lastProgressAt
		};
	}

	return { inspect, pulse, repair: () => repair.request("manual_repair"), snapshot };
}

module.exports = {
	DEFAULT_BACKLOG_STALE_MS,
	DEFAULT_CONTROL_STALL_MS,
	DEFAULT_KILL_GRACE_MS,
	DEFAULT_PARENT_STALE_MS,
	create
};
