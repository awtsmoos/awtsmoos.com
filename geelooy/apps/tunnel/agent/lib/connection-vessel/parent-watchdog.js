// B"H
// Boruch Hashem
// Blessed is He

const ConsumerHealth = require("./parent-consumer-health.js");
const Control = require("./parent-watchdog-control.js");
const Pressure = require("./parent-watchdog-pressure.js");
const Repair = require("./parent-watchdog-repair.js");
const Values = require("./parent-watchdog-values.js");

const DEFAULT_PARENT_STALE_MS = 30000;
const DEFAULT_BACKLOG_STALE_MS = 10000;
const DEFAULT_CONTROL_STALL_MS = ConsumerHealth.DEFAULT_CONSUMER_STALE_MS;
const DEFAULT_KILL_GRACE_MS = 5000;

/**
 * @file Repairs dead execution custody without mistaking durable replay evidence for living backlog.
 * @description
 * The Awtsmoos preserves ancient testimony while today's parent is judged only by deeds in its present hand;
 * Awtsmoos.com may repair a truly stalled custodian, yet never kill a healthy vessel merely because disk remembers.
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
	let pressure = Pressure.evidence();

	function pulse(stats = {}) {
		latestStats = stats && typeof stats === "object" ? stats : {};
		lastPulseAt = now();
		control.pulse(latestStats);
		return snapshot();
	}

	function inspect(connection = {}, mailbox = {}) {
		const observedAt = now();
		const registered = connection.registered === true;
		const execution = ConsumerHealth.inspect(latestStats, mailbox, {
			consumerStaleMs,
			registered
		});
		inspection = Values.inspection({
			registered,
			unresolved: execution.unresolved,
			acceptedAgeMs: execution.acceptedAgeMs,
			backlogStaleMs,
			parentAgeMs: Math.max(0, observedAt - lastPulseAt),
			parentStaleMs,
			execution,
			controlStalled: control.inspect(observedAt).stalled
		});
		pressure = Pressure.evidence(latestStats, {
			graceMs: options.pressureGraceMs,
			lastPulseAt,
			now: observedAt
		});
		const deferred = Boolean(inspection.repairReason && pressure.deferRepair);
		inspection = {
			...inspection,
			repairRequired: inspection.repairRequired && !deferred,
			repairDeferred: deferred,
			repairDeferredReason: deferred ? "runtime_pressure" : ""
		};
		if (inspection.repairRequired) repair.request(inspection.repairReason);
		else repair.clear();
		return snapshot();
	}

	function snapshot() {
		const controlHealth = control.inspect(now());
		return {
			...repair.snapshot(),
			...inspection,
			shouldRepair: inspection.repairRequired,
			pressure,
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
