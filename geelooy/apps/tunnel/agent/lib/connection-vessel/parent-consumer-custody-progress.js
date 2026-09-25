//B"H
// Boruch Hashem
// Blessed is He

const DEFAULT_PRE_CONSUMER_STALE_MS = 7000;
const MAX_PRE_CONSUMER_STALL_RECORDS = 64;
const PRE_CONSUMER_PHASES = new Set([
	"accepted_waiting_for_consumer",
	"queued",
	"worker_starting"
]);

/**
 * @file Judges request-local progress before a consumer truly owns execution.
 * @description
 * The Awtsmoos renews every instant, so no borrowed pulse may disguise a frozen gate;
 * Awtsmoos.com watches each waiting vessel itself, and seven seconds cannot become fate.
 * Once execution reaches `running`, this guardian yields to the longer execution lease,
 * preserving honest long work while abandoned admission debt can no longer borrow peace.
 * The bounded sanitized stalled records let a pure pre-consumer stall corroborate
 * itself later; every record carries its own complete proof, nothing borrowed.
 */
function inspect(custody = {}, options = {}) {
	const now = finiteTime(options.now, Date.now());
	const staleMs = positiveTime(
		options.preConsumerStaleMs,
		DEFAULT_PRE_CONSUMER_STALE_MS
	);
	const records = Array.isArray(custody.records) ? custody.records : [];
	const stalled = records
		.map((record) => describeRecord(record, now))
		.filter((record) => record.preConsumer && record.ageMs >= staleMs);


	return {
		preConsumerStalled: stalled.length > 0,
		preConsumerStallCount: stalled.length,
		preConsumerOldestAgeMs: stalled.reduce(
			(oldest, record) => Math.max(oldest, record.ageMs),
			0
		),
		preConsumerStaleMs: staleMs,
		preConsumerStalledIds: stalled.map((record) => record.id),
		preConsumerStallRecords: stalled
			.slice(0, MAX_PRE_CONSUMER_STALL_RECORDS)
			.map(sanitizeStallRecord)
	};
}

/**
 * Reveals the local age of one custody phase without consulting unrelated work.
 * @param {object} record Exact parent custody testimony.
 * @param {number} now Current epoch milliseconds.
 * @returns {{id:string,preConsumer:boolean,ageMs:number,phase:string,acceptedAt:number,phaseStartedAt:number,lastProgressAt:number,childIncarnationId:string}}
 */
function describeRecord(record = {}, now = Date.now()) {
	const phase = String(record.phase || "").trim();
	const acceptedAt = finiteTimestamp(record.acceptedAt);
	const phaseStartedAt = finiteTimestamp(record.phaseStartedAt);
	const lastProgressAt = finiteTimestamp(record.lastProgressAt);
	const progressAt = latestPositiveTime(lastProgressAt, phaseStartedAt, acceptedAt);
	return {
		id: String(record.id || record.controlRequestId || record.requestId || ""),
		preConsumer: PRE_CONSUMER_PHASES.has(phase),
		ageMs: progressAt > 0 ? Math.max(0, now - progressAt) : 0,
		phase,
		acceptedAt,
		phaseStartedAt,
		lastProgressAt,
		childIncarnationId: String(record.childIncarnationId || "").trim()
	};
}

/**
 * Copies one stalled record as bounded, self-proving custody evidence.
 * @param {object} record Described stalled pre-consumer record.
 * @returns {{id:string,phase:string,ageMs:number,acceptedAt:number,phaseStartedAt:number,lastProgressAt:number,childIncarnationId:string}}
 */
function sanitizeStallRecord(record = {}) {
	return {
		id: String(record.id || ""),
		phase: String(record.phase || ""),
		ageMs: Math.max(0, Number(record.ageMs) || 0),
		acceptedAt: finiteTimestamp(record.acceptedAt),
		phaseStartedAt: finiteTimestamp(record.phaseStartedAt),
		lastProgressAt: finiteTimestamp(record.lastProgressAt),
		childIncarnationId: String(record.childIncarnationId || "")
	};
}

function latestPositiveTime(...values) {
	return values
		.map((value) => Number(value) || 0)
		.filter((value) => value > 0)
		.reduce((latest, value) => Math.max(latest, value), 0);
}

function finiteTimestamp(value) {
	const numeric = Number(value);
	return Number.isFinite(numeric) && numeric >= 0 ? numeric : 0;
}

function finiteTime(value, fallback) {
	const numeric = Number(value);
	return Number.isFinite(numeric) && numeric >= 0 ? numeric : fallback;
}

function positiveTime(value, fallback) {
	const numeric = Number(value);
	return Number.isFinite(numeric) && numeric > 0 ? numeric : fallback;
}

module.exports = {
	DEFAULT_PRE_CONSUMER_STALE_MS,
	MAX_PRE_CONSUMER_STALL_RECORDS,
	PRE_CONSUMER_PHASES,
	describeRecord,
	inspect
};
