// B"H

/**
 * B"H — One key may open one canonical command. Repetition joins the original
 * vessel; contradiction is rejected before another process receives breath.
 */
function createIdempotencyLedger(options = {}) {
	const records = new Map();
	const maxRecords = positive(options.maxRecords, 4096);
	const terminalTtlMs = positive(options.terminalTtlMs, 30 * 60 * 1000);

	function begin(input = {}) {
		collect();
		const key = clean(input.idempotencyKey);
		if (!key) return { ok: true, kind: "unkeyed" };
		const requestHash = clean(input.requestHash || input.commandHash);
		const existing = records.get(key);
		if (existing) {
			if (existing.requestHash !== requestHash) {
				return { ok: false, error: "idempotency_conflict", status: 409, record: clone(existing) };
			}
			return { ok: true, kind: "coalesced", record: clone(existing) };
		}
		if (records.size >= maxRecords && !evictOneTerminal()) {
			return { ok: false, error: "idempotency_ledger_full", status: 429, retryable: true };
		}
		const record = {
			idempotencyKey: key,
			requestHash,
			jobId: clean(input.jobId),
			state: "accepted",
			createdAt: now(),
			updatedAt: now()
		};
		records.set(key, record);
		return { ok: true, kind: "created", record: clone(record) };
	}

	function update(key, patch = {}) {
		const id = clean(key);
		const current = records.get(id);
		if (!current) return null;
		const next = { ...current, ...patch, idempotencyKey: id, updatedAt: now() };
		records.set(id, next);
		return clone(next);
	}

	function remove(key) {
		return records.delete(clean(key));
	}

	function collect(time = Date.now()) {
		let removed = 0;
		for (const [key, record] of records) {
			if (!isTerminal(record.state)) continue;
			if (time - Date.parse(record.updatedAt || record.createdAt) < terminalTtlMs) continue;
			records.delete(key);
			removed += 1;
		}
		return removed;
	}

	function evictOneTerminal() {
		for (const [key, record] of records) {
			if (!isTerminal(record.state)) continue;
			return records.delete(key);
		}
		return false;
	}

	function snapshot() {
		return { records: records.size, maxRecords, terminalTtlMs };
	}

	return { begin, collect, remove, snapshot, update };
}

function isTerminal(state) {
	return ["completed", "failed", "timed_out", "cancelled", "rejected"].includes(String(state || ""));
}
function clean(value) { return String(value || "").trim(); }
function clone(value) { return structuredClone(value); }
function now() { return new Date().toISOString(); }
function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? Math.floor(number) : fallback;
}
module.exports = { createIdempotencyLedger };
