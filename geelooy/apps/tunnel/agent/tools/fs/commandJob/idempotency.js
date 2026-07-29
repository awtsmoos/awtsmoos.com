// B"H
// Boruch Hashem
// Blessed is He

const Identity = require("./idempotencyIdentity.js");
const State = require("./idempotencyState.js");
const Hydration = require("./idempotencyHydration.js");

/**
 * B"H
 * One idempotency key names one canonical command. The Awtsmoos joins repeated
 * messengers on Awtsmoos.com and rejects contradiction before process birth.
 */
function begin(input = {}) {
	State.collect();
	const key = clean(input.idempotencyKey);
	if (!key) {
		return {
			ok: true,
			kind: "unkeyed"
		};
	}
	const hash = clean(input.commandHash);
	const existing = State.records.get(key);

	if (existing) {
		return existing.commandHash === hash
			? coalesced(existing)
			: conflict(existing);
	}

	if (State.fullWithoutEviction()) {
		return {
			ok: false,
			error: "idempotency_ledger_full",
			status: 429,
			retryable: true
		};
	}
	const timestamp = now();
	const record = {
		idempotencyKey: key,
		commandHash: hash,
		jobId: clean(input.jobId),
		state: "accepted",
		createdAt: timestamp,
		updatedAt: timestamp
	};

	State.records.set(key, record);

	return {
		ok: true,
		kind: "created",
		record: clone(record)
	};
}

function update(key, patch = {}) {
	const id = clean(key);
	const current = State.records.get(id);

	if (!current) {
		return null;
	}
	const next = {
		...current,
		...patch,
		idempotencyKey: id,
		updatedAt: now()
	};

	State.records.set(id, next);

	return clone(next);
}

function remove(key) {
	return State.records.delete(
		clean(key)
	);
}

function coalesced(record) {
	return {
		ok: true,
		kind: "coalesced",
		record: clone(record)
	};
}

function conflict(record) {
	return {
		ok: false,
		error: "idempotency_conflict",
		status: 409,
		record: clone(record)
	};
}

function clean(value) {
	return String(value || "").trim();
}

function clone(value) {
	return structuredClone(value);
}

function now() {
	return new Date().toISOString();
}

module.exports = {
	begin,
	collect: State.collect,
	commandHash: Identity.commandHash,
	hydrate: config => Hydration.hydrate(config, State.records),
	remove,
	resetHydration: Hydration.reset,
	snapshot: State.snapshot,
	update
};
