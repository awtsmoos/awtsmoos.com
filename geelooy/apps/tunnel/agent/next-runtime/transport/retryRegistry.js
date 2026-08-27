// B"H
const Shapes = require("./retryShapes.js");

/**
 * B"H — Retry asks for the original operation by its original name. It never
 * creates a second tunnel request merely because the first answer arrived late.
 */
function createRetryRegistry(options = {}) {
	const records = new Map();
	const maxRecords = positive(options.maxRecords, 10000);
	const completedTtlMs = positive(options.completedTtlMs, 5 * 60 * 1000);

	function begin(input = {}) {
		collect();
		const controlRequestId = clean(input.controlRequestId);
		const requestedAction = clean(input.requestedAction);
		if (!controlRequestId || !requestedAction) return { ok: false, status: 400, error: "invalid_retry_identity" };
		const existing = records.get(controlRequestId);
		if (existing) {
			return existing.requestedAction === requestedAction
				? { ok: true, kind: "coalesced", record: clone(existing) }
				: Shapes.conflict(existing, requestedAction);
		}
		if (records.size >= maxRecords && !evictCompleted()) return { ok: false, status: 429, error: "retry_registry_full" };
		const record = { controlRequestId, requestedAction, state: "pending", createdAt: now(), updatedAt: now(), progress: null, result: null };
		records.set(controlRequestId, record);
		return { ok: true, kind: "created", record: clone(record) };
	}

	function progress(controlRequestId, value) {
		return update(controlRequestId, { progress: structuredClone(value), state: "pending" });
	}

	function complete(controlRequestId, result) {
		return update(controlRequestId, { result: structuredClone(result), state: "completed", completedAt: now() });
	}

	function poll(controlRequestId, requestedAction = "") {
		collect();
		const id = clean(controlRequestId);
		const record = records.get(id);
		if (!record) return Shapes.missing(id);
		if (requestedAction && record.requestedAction !== clean(requestedAction)) return Shapes.conflict(record, clean(requestedAction));
		return record.state === "completed" ? clone(record.result) : { ...Shapes.pending(record), progress: clone(record.progress) };
	}

	function update(controlRequestId, patch) {
		const id = clean(controlRequestId);
		const current = records.get(id);
		if (!current) return null;
		const next = { ...current, ...patch, controlRequestId: id, updatedAt: now() };
		records.set(id, next);
		return clone(next);
	}

	function collect(time = Date.now()) {
		let removed = 0;
		for (const [id, record] of records) {
			if (record.state !== "completed") continue;
			if (time - Date.parse(record.completedAt || record.updatedAt) < completedTtlMs) continue;
			records.delete(id);
			removed += 1;
		}
		return removed;
	}

	function evictCompleted() {
		for (const [id, record] of records) if (record.state === "completed") return records.delete(id);
		return false;
	}

	function snapshot() {
		return { records: records.size, pending: [...records.values()].filter(record => record.state === "pending").length, maxRecords };
	}

	return { begin, collect, complete, poll, progress, snapshot };
}
function clean(value) { return String(value || "").trim(); }
function clone(value) { return value == null ? value : structuredClone(value); }
function now() { return new Date().toISOString(); }
function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? Math.floor(number) : fallback;
}
module.exports = { createRetryRegistry };
