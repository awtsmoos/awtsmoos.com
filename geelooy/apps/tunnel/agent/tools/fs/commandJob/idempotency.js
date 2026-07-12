// B"H
const crypto = require('node:crypto');

/**
 * B"H — One idempotency key names one canonical command. Repetition joins the
 * first job; contradiction is rejected before another process receives breath.
 */
const records = new Map();
const MAX_RECORDS = positive(process.env.AWTSMOOS_COMMAND_IDEMPOTENCY_MAX, 4096);
const TERMINAL_TTL_MS = positive(
	process.env.AWTSMOOS_COMMAND_IDEMPOTENCY_TTL_MS,
	30 * 60 * 1000
);

function commandHash(input = {}) {
	const canonical = JSON.stringify(sortValue({
		command: String(input.command || ''),
		cwd: String(input.cwd || ''),
		shell: String(input.shell || ''),
		env: input.env || {}
	}));
	return crypto.createHash('sha256').update(canonical).digest('hex');
}

function begin(input = {}) {
	collect();
	const key = clean(input.idempotencyKey);
	if (!key) return { ok: true, kind: 'unkeyed' };
	const hash = clean(input.commandHash);
	const existing = records.get(key);
	if (existing) {
		if (existing.commandHash !== hash) {
			return {
				ok: false,
				error: 'idempotency_conflict',
				status: 409,
				record: clone(existing)
			};
		}
		return { ok: true, kind: 'coalesced', record: clone(existing) };
	}
	if (records.size >= MAX_RECORDS && !evictTerminal()) {
		return {
			ok: false,
			error: 'idempotency_ledger_full',
			status: 429,
			retryable: true
		};
	}
	const record = {
		idempotencyKey: key,
		commandHash: hash,
		jobId: clean(input.jobId),
		state: 'accepted',
		createdAt: now(),
		updatedAt: now()
	};
	records.set(key, record);
	return { ok: true, kind: 'created', record: clone(record) };
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
		if (time - Date.parse(record.updatedAt || record.createdAt) < TERMINAL_TTL_MS) continue;
		records.delete(key);
		removed += 1;
	}
	return removed;
}

function snapshot() {
	return { records: records.size, maxRecords: MAX_RECORDS, terminalTtlMs: TERMINAL_TTL_MS };
}

function evictTerminal() {
	for (const [key, record] of records) {
		if (isTerminal(record.state)) return records.delete(key);
	}
	return false;
}

function isTerminal(state) {
	return ['completed','failed','timed_out','cancelled','cleanup_failed','stale_lost_worker','identity_unverified','rejected'].includes(String(state || ''));
}

function sortValue(value) {
	if (Array.isArray(value)) return value.map(sortValue);
	if (!value || typeof value !== 'object') return value;
	return Object.fromEntries(Object.keys(value).sort().map(key => [key, sortValue(value[key])]));
}

function clean(value) { return String(value || '').trim(); }
function clone(value) { return structuredClone(value); }
function now() { return new Date().toISOString(); }
function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? Math.floor(number) : fallback;
}

module.exports = { begin, collect, commandHash, remove, snapshot, update };
