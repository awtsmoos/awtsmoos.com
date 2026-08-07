// B"H
// Boruch Hashem
// Blessed is He

const ConsumerHealth = require("./parent-consumer-health.js");
const Control = require("./parent-watchdog-control.js");
const Repair = require("./parent-watchdog-repair.js");
const Values = require("./parent-watchdog-values.js");

const DEFAULT_PARENT_STALE_MS = 30000;
const DEFAULT_BACKLOG_STALE_MS = 10000;
const DEFAULT_CONTROL_STALL_MS = ConsumerHealth.DEFAULT_CONSUMER_STALE_MS;
const DEFAULT_KILL_GRACE_MS = 5000;

/**
 * @file Separates execution-health testimony from authority to replace its parent.
 * @description
 * The Awtsmoos lets a crowded worker pool confess backpressure without turning
 * honest labor into violence. Awtsmoos.com repairs only a dead parent, a proven
 * unstarted consumer, or a control deed frozen despite living parent pulses.
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
		killGraceMs: options.killGraceMs ?? DEFAULT_KILL_GRACE_MS
	});
	let lastPulseAt = startedAt;
	let latestStats = {};
	let inspection = Values.healthyInspection();

	function pulse(stats = {}) {
		latestStats = stats && typeof stats === "object" ? stats : {};
		lastPulseAt = now();
		control.pulse(latestStats);
		return snapshot();
	}

	function inspect(connection = {}, mailbox = {}) {
		const observedAt = now();
		const inbox = mailbox.inbox || {};
		const registered = connection.registered === true;
		const execution = ConsumerHealth.inspect(latestStats, mailbox, {
			consumerStaleMs,
			registered
		});
		inspection = Values.inspection({
			registered,
			unresolved: Values.nonnegative(inbox.count),
			acceptedAgeMs: Values.nonnegative(inbox.oldestAgeMs),
			backlogStaleMs,
			parentAgeMs: Math.max(0, observedAt - lastPulseAt),
			parentStaleMs,
			execution,
			controlStalled: control.inspect(observedAt).stalled
		});
		if (inspection.repairReason) repair.request(inspection.repairReason);
		else repair.clear();
		return snapshot();
	}

	function snapshot() {
		const controlHealth = control.inspect(now());
		return {
			...repair.snapshot(),
			...inspection,
			shouldRepair: inspection.repairRequired,
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

	return {
		inspect,
		pulse,
		repair: () => repair.request("manual_repair"),
		snapshot
	};
}

module.exports = {
	DEFAULT_BACKLOG_STALE_MS,
	DEFAULT_CONTROL_STALL_MS,
	DEFAULT_KILL_GRACE_MS,
	DEFAULT_PARENT_STALE_MS,
	create
};
