// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Interprets per-lane execution data-path telemetry against custody records.
 * @description
 * The Awtsmoos refuses to judge a lane from silence; Awtsmoos.com therefore names a
 * lane stalled only when two independent witnesses agree: the child's own per-lane
 * data-path telemetry (in-flight work older than the lane bound with no progress
 * since) AND the parent's custody records (deeds still held unresolved). Either
 * witness alone can only earn busy, idle, or unknown — never a stall verdict — so a
 * lagging reporter or a drained lane can never trigger a false repair alarm.
 *
 * Lane time bounds mirror the executor policy (agent/lib/runtime/limit-timeouts.js
 * LANE_TIMEOUT_MS); lanes outside the known order fall back to a bounded five-minute
 * default. Telemetry older than twice the pulse cadence is stale: the settlement
 * pulse ticks on the child's existing publish breath
 * (agent/lib/connection-vessel/child-runtime.js, setInterval(cycle.publish, 500)),
 * so anything older never describes the living lane. Missing, partial, or stale
 * telemetry always yields unknown — a quiet reporter is never called stalled.
 */

const LANE_ORDER = Object.freeze([
	"p0_control",
	"p0_wait",
	"p0_observe",
	"p1_command_admission",
	"p1_fs_light",
	"p2_chrome_light",
	"p3_heavy",
	"p4_bulk"
]);

const MINUTE = 60 * 1000;

/**
 * Mirrors agent/lib/runtime/limit-timeouts.js LANE_TIMEOUT_MS defaults. Kept as a
 * frozen copy (rather than a require) so this pure vessel stays dependency-free and
 * unit-testable; pass { laneBounds } to interpret() to override.
 */
const DEFAULT_LANE_BOUNDS_MS = Object.freeze({
	p0_control: 5 * MINUTE,
	p0_wait: 2 * MINUTE,
	p0_observe: 2 * MINUTE,
	p1_command_admission: 2 * MINUTE,
	p1_fs_light: 30 * MINUTE,
	p2_chrome_light: 30 * MINUTE,
	p3_heavy: 4 * 60 * MINUTE,
	p4_bulk: 12 * 60 * MINUTE
});

/** Bounded default for lanes outside the known order. */
const DEFAULT_UNKNOWN_LANE_BOUND_MS = 5 * MINUTE;

/** The settlement pulse resolves its provider once per child publish breath. */
const DEFAULT_PULSE_CADENCE_MS = 500;

/** Telemetry older than this many pulse cadences no longer describes the lane. */
const STALE_AFTER_CADENCES = 2;

/**
 * Finds the child's per-lane data-path telemetry inside a stats object. Accepts the
 * pulse payload nested under outboxSettlement (the child's settlement pulse as
 * mirrored through the existing STATE/heartbeat channel) or carried top-level.
 *
 * @param {object} stats Stats object that may carry child telemetry.
 * @returns {object|null} Raw lane data-path telemetry, or null when absent.
 */
function extractFromStats(stats = {}) {
	if (!stats || typeof stats !== "object") return null;
	const direct = stats.laneDataPath;
	if (direct && typeof direct === "object") return direct;
	const pulse = stats.outboxSettlement;
	if (pulse && typeof pulse === "object") {
		const nested = pulse.laneDataPath;
		if (nested && typeof nested === "object") return nested;
	}
	return null;
}

/**
 * Validates and bounds raw per-lane data-path telemetry. Unknown lane names are
 * dropped; numeric fields are floored to non-negative integers (missing fields stay
 * null so partial telemetry is detectable downstream). Never throws.
 *
 * @param {object} raw Raw telemetry, e.g. from the settlement pulse provider.
 * @param {number|Function} observedAt Clock used when raw carries no timestamp.
 * @returns {object|null} { observedAt, lanes } or null when no usable telemetry.
 */
function normalizeChildTelemetry(raw, observedAt = Date.now()) {
	if (!raw || typeof raw !== "object") return null;
	const lanesRaw = raw.lanes;
	if (!lanesRaw || typeof lanesRaw !== "object") return null;
	const lanes = {};
	for (const lane of LANE_ORDER) {
		const entry = lanesRaw[lane];
		if (!entry || typeof entry !== "object") continue;
		lanes[lane] = {
			started: nonnegativeInt(entry.started),
			completed: nonnegativeInt(entry.completed),
			oldestInFlightAgeMs: nonnegativeInt(entry.oldestInFlightAgeMs),
			lastProgressAt: nonnegativeInt(entry.lastProgressAt),
			lastDrainAt: nonnegativeInt(entry.lastDrainAt),
			wedgedEvictions: nonnegativeInt(entry.wedgedEvictions)
		};
	}
	const fallbackAt = resolveNow(observedAt);
	const rawAt = Number(raw.observedAt);
	return {
		observedAt: Number.isFinite(rawAt) && rawAt > 0 ? Math.floor(rawAt) : fallbackAt,
		lanes
	};
}

/**
 * Interprets every known lane from numbers, never from silence.
 *
 * @param {object} options
 * @param {object} options.childTelemetry Raw per-lane telemetry (pulse schema).
 * @param {object} options.parentCustody Custody evidence ({ count, records }).
 * @param {number|Function} options.now Deterministic clock for tests.
 * @param {object} options.laneBounds Optional per-lane bound overrides (ms).
 * @param {number} options.pulseCadenceMs Pulse cadence used for the stale rule.
 * @returns {object} { observedAt, telemetryPresent, telemetryStale, lanes: [{lane, verdict, evidence}] }
 */
function interpret(options = {}) {
	const nowValue = resolveNow(options.now);
	const cadenceMs = positiveInt(options.pulseCadenceMs, DEFAULT_PULSE_CADENCE_MS);
	// B"H scheduler-witness fallback: when the child has not (yet) supplied its own
	// laneDataPath, the scheduler's own laneStats serve as the independent witness.
	// Sound inference: in a FIFO-fair lane, in-flight items were dequeued before the
	// oldest queued item arrived, so oldestQueuedAgeMs is a lower bound on oldest
	// in-flight age whenever inflight > 0.
	const pulseTelemetry = normalizeChildTelemetry(options.childTelemetry, nowValue);
	const schedulerLaneStats = options.childTelemetry &&
		typeof options.childTelemetry === "object" &&
		!Array.isArray(options.childTelemetry) &&
		options.childTelemetry.schedulerLaneStats &&
		typeof options.childTelemetry.schedulerLaneStats === "object"
		? options.childTelemetry.schedulerLaneStats
		: null;
	const telemetry = pulseTelemetry ||
		(schedulerLaneStats ? laneStatsToTelemetry(schedulerLaneStats, nowValue) : null);
	const custody = normalizeCustody(options.parentCustody);
	const stale = isStale(telemetry, nowValue, cadenceMs);
	const bounds = resolveBounds(options.laneBounds);
	const lanes = LANE_ORDER.map((lane) =>
		interpretLane(lane, telemetry, stale, custody, nowValue, bounds)
	);
	return {
		observedAt: nowValue,
		telemetryPresent: telemetry !== null,
		telemetryStale: stale,
		pulseCadenceMs: cadenceMs,
		lanes
	};
}

function interpretLane(lane, telemetry, stale, custody, nowValue, bounds) {
	const boundMs = bounds[lane] || DEFAULT_UNKNOWN_LANE_BOUND_MS;
	const base = { lane, boundMs, custodyUnresolved: custody.count };
	if (!telemetry) {
		return { lane, verdict: "unknown",
			evidence: { ...base, reason: "telemetry_missing" } };
	}
	if (stale) {
		return { lane, verdict: "unknown",
			evidence: { ...base, reason: "telemetry_stale",
				telemetryAgeMs: Math.max(0, nowValue - telemetry.observedAt) } };
	}
	const entry = telemetry.lanes[lane];
	if (entry && entry.schedulerWitness === true) {
		return interpretSchedulerWitnessLane(lane, entry, custody, bounds);
	}
	if (!entry || !telemetryComplete(entry)) {
		return { lane, verdict: "unknown",
			evidence: { ...base, reason: "telemetry_partial" } };
	}
	const inFlight = Math.max(0, entry.started - entry.completed);
	const hasWork = inFlight > 0 || entry.oldestInFlightAgeMs > 0;
	const progressAgeMs = entry.lastProgressAt > 0
		? Math.max(0, nowValue - entry.lastProgressAt)
		: null;
	const evidence = {
		...base,
		inFlight,
		oldestInFlightAgeMs: entry.oldestInFlightAgeMs,
		progressAgeMs,
		lastDrainAt: entry.lastDrainAt,
		wedgedEvictions: entry.wedgedEvictions === null ? 0 : entry.wedgedEvictions
	};
	if (!hasWork) {
		if (custody.count === 0) {
			return { lane, verdict: "idle",
				evidence: { ...evidence, reason: "idle_no_work_no_custody" } };
		}
		return { lane, verdict: "unknown",
			evidence: { ...evidence, reason: "drained_but_custody_open" } };
	}
	const progressFresh = progressAgeMs !== null && progressAgeMs < boundMs;
	const inflightYoung = entry.oldestInFlightAgeMs < boundMs;
	if (progressFresh || inflightYoung) {
		return { lane, verdict: "busy",
			evidence: { ...evidence,
				reason: progressFresh ? "busy_recent_progress" : "busy_inflight_within_bound" } };
	}
	// No-false-alarm core: the child's numbers alone are never enough. A stall
	// verdict requires the parent's custody records to agree that deeds are open.
	if (custody.count > 0) {
		return { lane, verdict: "stalled",
			evidence: { ...evidence,
				reason: "stalled_old_inflight_no_progress_custody_open" } };
	}
	return { lane, verdict: "unknown",
		evidence: { ...evidence, reason: "child_suspicious_custody_clear" } };
}

function telemetryComplete(entry) {
	return entry.started !== null &&
		entry.completed !== null &&
		entry.oldestInFlightAgeMs !== null &&
		entry.lastProgressAt !== null;
}

function isStale(telemetry, nowValue, cadenceMs) {
	if (!telemetry) return false;
	const ageMs = Math.max(0, nowValue - telemetry.observedAt);
	return ageMs > STALE_AFTER_CADENCES * cadenceMs;
}

function normalizeCustody(custody = {}) {
	if (!custody || typeof custody !== "object") return { count: 0 };
	const records = Array.isArray(custody.records) ? custody.records : [];
	const count = nonnegativeInt(custody.count);
	return { count: count === null ? records.length : count };
}

function resolveBounds(overrides = {}) {
	if (!overrides || typeof overrides !== "object") return DEFAULT_LANE_BOUNDS_MS;
	const bounds = { ...DEFAULT_LANE_BOUNDS_MS };
	for (const lane of LANE_ORDER) {
		const value = positiveInt(overrides[lane], 0);
		if (value > 0) bounds[lane] = value;
	}
	return bounds;
}

function resolveNow(now) {
	if (typeof now === "function") {
		const value = Number(now());
		return Number.isFinite(value) && value >= 0 ? Math.floor(value) : Date.now();
	}
	const value = Number(now);
	return Number.isFinite(value) && value > 0 ? Math.floor(value) : Date.now();
}

function nonnegativeInt(value) {
	const number = Number(value);
	return Number.isFinite(number) ? Math.max(0, Math.floor(number)) : null;
}

function positiveInt(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? Math.floor(number) : fallback;
}

/**
 * Adapts scheduler laneStats ({inflight, oldestQueuedAgeMs, advisoryTimeoutMs})
 * into the telemetry schema so the dual-witness interpreter can judge wedged
 * in-flight lanes from numbers the scheduler already publishes on the existing
 * stats pulse - no new channel, no new chatter. Entries carry
 * schedulerWitness: true and bypass the pulse-schema completeness gate.
 *
 * @param {object} laneStats Per-lane scheduler stats (laneStats shape).
 * @param {number|Function} observedAt Clock for the adapted snapshot.
 * @returns {object|null} { observedAt, lanes } or null when unusable.
 */
function laneStatsToTelemetry(laneStats, observedAt = Date.now()) {
	if (!laneStats || typeof laneStats !== "object" || Array.isArray(laneStats)) return null;
	const observed = resolveNow(observedAt);
	const lanes = {};
	for (const lane of LANE_ORDER) {
		const raw = laneStats[lane];
		if (!raw || typeof raw !== "object") continue;
		const inflight = nonnegativeInt(raw.inflight);
		const oldestQueuedAgeMs = nonnegativeInt(raw.oldestQueuedAgeMs);
		if (inflight === null || oldestQueuedAgeMs === null) continue;
		lanes[lane] = {
			schedulerWitness: true,
			inflight,
			oldestQueuedAgeMs,
			advisoryTimeoutMs: nonnegativeInt(raw.advisoryTimeoutMs),
			started: null,
			completed: null,
			oldestInFlightAgeMs: null,
			lastProgressAt: null,
			lastDrainAt: null,
			wedgedEvictions: null
		};
	}
	if (Object.keys(lanes).length === 0) return null;
	return { observedAt: observed, lanes };
}

/**
 * Judges one scheduler-witness lane. Only a wedged IN-FLIGHT lane can earn
 * stalled here: inflight > 0 with the queue head older than the lane bound
 * proves (FIFO) the oldest in-flight work is older than the bound. A stall
 * verdict still requires the parent's custody records to agree; scheduler
 * suspicion alone stays unknown. Queued-only backlogs are left to the
 * existing stale-idle lane logic.
 */
function interpretSchedulerWitnessLane(lane, entry, custody, bounds) {
	const boundMs = bounds[lane] || DEFAULT_UNKNOWN_LANE_BOUND_MS;
	const base = {
		lane,
		boundMs,
		custodyUnresolved: custody.count,
		witness: "scheduler_lane_stats",
		inflight: entry.inflight,
		oldestQueuedAgeMs: entry.oldestQueuedAgeMs
	};
	if (entry.inflight > 0) {
		if (entry.oldestQueuedAgeMs >= boundMs) {
			if (custody.count > 0) {
				return { lane, verdict: "stalled",
					evidence: { ...base, reason: "stalled_wedged_inflight_custody_open" } };
			}
			return { lane, verdict: "unknown",
				evidence: { ...base, reason: "scheduler_suspicious_custody_clear" } };
		}
		return { lane, verdict: "busy",
			evidence: { ...base, reason: "busy_inflight_within_bound" } };
	}
	if (entry.oldestQueuedAgeMs === 0) {
		if (custody.count === 0) {
			return { lane, verdict: "idle",
				evidence: { ...base, reason: "idle_no_work_no_custody" } };
		}
		return { lane, verdict: "unknown",
			evidence: { ...base, reason: "drained_but_custody_open" } };
	}
	return { lane, verdict: "unknown",
		evidence: { ...base, reason: "queued_backlog_not_wedged" } };
}

module.exports = {
	DEFAULT_LANE_BOUNDS_MS,
	DEFAULT_PULSE_CADENCE_MS,
	DEFAULT_UNKNOWN_LANE_BOUND_MS,
	LANE_ORDER,
	STALE_AFTER_CADENCES,
	extractFromStats,
	interpret,
	laneStatsToTelemetry,
	normalizeChildTelemetry
};
