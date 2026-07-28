// B"H
// Boruch Hashem
// Blessed is He

const DEFAULT_PARENT_STALE_MS = 30000;
const DEFAULT_BACKLOG_STALE_MS = 10000;
const DEFAULT_KILL_GRACE_MS = 10000;
const DEFAULT_CONTROL_STALL_MS = 20000;

/**
 * The connection vessel can still breathe when the execution parent is wedged.
 * It requests a supervised parent restart only when registration is live, durable
 * inbox work is old, and the parent's independent pulse has also stopped.
 */
function create(options = {}) {
	const parentPid = positive(options.parentPid, 0);
	const parentStaleMs = bounded(
		options.parentStaleMs ?? process.env.AWTSMOOS_PARENT_STALE_MS,
		DEFAULT_PARENT_STALE_MS,
		5000,
		10 * 60 * 1000
	);
	const backlogStaleMs = bounded(
		options.backlogStaleMs ?? process.env.AWTSMOOS_PARENT_BACKLOG_STALE_MS,
		DEFAULT_BACKLOG_STALE_MS,
		5000,
		10 * 60 * 1000
	);
	const killGraceMs = bounded(
		options.killGraceMs ?? process.env.AWTSMOOS_PARENT_KILL_GRACE_MS,
		DEFAULT_KILL_GRACE_MS,
		1000,
		60000
	);
	const controlStallMs = bounded(
		options.controlStallMs ?? process.env.AWTSMOOS_PARENT_CONTROL_STALL_MS,
		DEFAULT_CONTROL_STALL_MS,
		10000,
		10 * 60 * 1000
	);
	const signal = options.signal || ((pid, name) => process.kill(pid, name));
	const setTimer = options.setTimer || setTimeout;
	const now = options.now || Date.now;
	let lastPulseAt = Number(options.startedAt || now());
	let lastControlProgressAt = lastPulseAt;
	let controlSignature = "";
	let controlInflight = 0;
	let controlQueued = 0;
	let repairs = 0;
	let repairing = false;

	function pulse(stats = {}) {
		const at = now();
		lastPulseAt = at;
		const lane = stats.lanes?.p0_control || {};
		const signature = [
			Number(lane.inflight || 0),
			Number(lane.queued || 0),
			Number(stats.lastSuccessfulActionAt || 0)
		].join(":");
		controlInflight = Number(lane.inflight || 0);
		controlQueued = Number(lane.queued || 0);
		if (signature !== controlSignature) {
			controlSignature = signature;
			lastControlProgressAt = at;
			repairing = false;
		}
		if (controlInflight + controlQueued === 0) repairing = false;
		return snapshot();
	}

	function inspect(connection = {}, mailbox = {}) {
		const at = now();
		const parentAgeMs = Math.max(0, at - lastPulseAt);
		const inbox = mailbox.inbox || {};
		const backlogAgeMs = Number(inbox.oldestAgeMs || 0);
		const controlBacklog = controlInflight + controlQueued;
		const controlStalled = controlBacklog > 0 &&
			at - lastControlProgressAt > controlStallMs;
		const shouldRepair = parentPid > 1 &&
			connection.registered === true &&
			Number(inbox.count || 0) > 0 &&
			backlogAgeMs > backlogStaleMs &&
			(parentAgeMs > parentStaleMs || controlStalled);
		if (shouldRepair && !repairing) repair();
		return {
			...snapshot(),
			backlogAgeMs,
			controlStalled,
			controlBacklog,
			shouldRepair
		};
	}

	function repair() {
		repairing = true;
		repairs += 1;
		try {
			signal(parentPid, "SIGTERM");
		} catch {
			repairing = false;
			return false;
		}
		const timer = setTimer(() => {
			try { signal(parentPid, "SIGKILL"); } catch {}
		}, killGraceMs);
		timer?.unref?.();
		return true;
	}

	function snapshot() {
		return {
			parentPid,
			lastPulseAt,
			parentAgeMs: Math.max(0, now() - lastPulseAt),
			parentStaleMs,
			backlogStaleMs,
			controlStallMs,
			controlInflight,
			controlQueued,
			controlBacklog: controlInflight + controlQueued,
			lastControlProgressAt,
			repairing,
			repairs
		};
	}

	return { inspect, pulse, repair, snapshot };
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? Math.floor(number) : fallback;
}

function bounded(value, fallback, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, positive(value, fallback)));
}

module.exports = {
	DEFAULT_BACKLOG_STALE_MS,
	DEFAULT_CONTROL_STALL_MS,
	DEFAULT_KILL_GRACE_MS,
	DEFAULT_PARENT_STALE_MS,
	create
};
