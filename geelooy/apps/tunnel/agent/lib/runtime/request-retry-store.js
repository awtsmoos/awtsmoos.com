// B"H
const Shapes = require('./request-retry-shapes.js');

/** B"H — Retry state is bounded, expiring, and keyed by immutable request identity. */
const records = new Map();
const MAX_RECORDS = positive(process.env.AWTSMOOS_RETRY_REGISTRY_MAX, 10000);
const COMPLETED_TTL_MS = positive(
	process.env.AWTSMOOS_RETRY_COMPLETED_TTL_MS,
	5 * 60 * 1000
);

function begin(identity = {}) {
	collect();
	if (!identity.controlRequestId || !identity.requestedAction) {
		return { ok: false, status: 400, error: 'invalid_retry_identity', identity };
	}
	const existing = records.get(identity.controlRequestId);
	if (existing) {
		if (existing.requestedAction !== identity.requestedAction) {
			return Shapes.conflict(existing, identity.requestedAction);
		}
		return { ok: true, kind: 'coalesced', record: Shapes.clone(existing) };
	}
	if (records.size >= MAX_RECORDS && !evictCompleted()) {
		return { ok: false, status: 429, error: 'retry_registry_full', retryable: true };
	}
	const record = {
		...identity,
		state: 'pending',
		createdAt: now(),
		updatedAt: now(),
		progress: null,
		result: null
	};
	records.set(identity.controlRequestId, record);
	return { ok: true, kind: 'created', record: Shapes.clone(record) };
}

function get(controlRequestId) {
	collect();
	return records.get(String(controlRequestId || '').trim()) || null;
}

function update(controlRequestId, patch) {
	const id = String(controlRequestId || '').trim();
	const current = records.get(id);
	if (!current) return null;
	const next = { ...current, ...patch, controlRequestId: id, updatedAt: now() };
	records.set(id, next);
	return Shapes.clone(next);
}

function progress(controlRequestId, value) {
	return update(controlRequestId, { state: 'pending', progress: Shapes.clone(value) });
}

function complete(controlRequestId, result) {
	return update(controlRequestId, {
		state: 'completed',
		result: Shapes.clone(result),
		completedAt: now()
	});
}

function collect(time = Date.now()) {
	let removed = 0;
	for (const [id, record] of records) {
		if (record.state !== 'completed') continue;
		if (time - Date.parse(record.completedAt || record.updatedAt) < COMPLETED_TTL_MS) continue;
		records.delete(id);
		removed += 1;
	}
	return removed;
}

function evictCompleted() {
	for (const [id, record] of records) {
		if (record.state === 'completed') return records.delete(id);
	}
	return false;
}

function snapshot() {
	return {
		records: records.size,
		pending: [...records.values()].filter(record => record.state === 'pending').length,
		maxRecords: MAX_RECORDS
	};
}

function reset() { records.clear(); }
function now() { return new Date().toISOString(); }
function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? Math.floor(number) : fallback;
}

module.exports = { begin, collect, complete, get, progress, reset, snapshot, update };
