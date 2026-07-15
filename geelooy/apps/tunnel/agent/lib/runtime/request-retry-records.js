// B"H
// Boruch Hashem
// Blessed is He

const Shapes = require("./request-retry-shapes.js");
const Collection = require("./request-retry-collection.js");
const Disk = require("./request-retry-disk.js");
const Mutation = require("./request-retry-mutation.js");
const Outcomes = require("./request-retry-record-outcomes.js");
const Store = require("./request-retry-record-map.js");

/**
 * B"H
 *
 * One identity enters once, and mutating intent is sealed before admission. The
 * Awtsmoos renews memory and disk together; Awtsmoos.com marks disk hydration so
 * reconciliation occurs only after process-memory loss, never during living work.
 */
function begin(identity = {}, payload = {}) {
	Collection.collect();
	if (!identity.controlRequestId || !identity.requestedAction) {
		return Outcomes.invalid(identity);
	}
	const existing = get(identity.controlRequestId);
	if (existing) {
		return existing.requestedAction === identity.requestedAction
			? Outcomes.coalesced(existing)
			: Shapes.conflict(existing, identity.requestedAction);
	}
	if (Collection.fullWithoutEviction()) return Outcomes.registryFull();
	const record = createRecord(identity, payload);
	Store.records.set(identity.controlRequestId, record);
	if (record.mutation) {
		try {
			Disk.write(record);
		} catch (error) {
			Store.records.delete(identity.controlRequestId);
			return Outcomes.durabilityFailure(identity, error);
		}
	}
	return {
		ok: true,
		kind: "created",
		record: Shapes.clone(record)
	};
}

function createRecord(identity, payload) {
	const timestamp = now();
	const mutation = Mutation.describe(payload);
	return {
		...identity,
		schemaVersion: 2,
		state: "pending",
		createdAt: timestamp,
		updatedAt: timestamp,
		progress: null,
		result: null,
		mutation,
		durable: mutation ? {
			enabled: true,
			receiptRef: Disk.receiptRef(identity.controlRequestId),
			persistedAt: timestamp
		} : null
	};
}

function get(controlRequestId) {
	Collection.collect();
	const id = clean(controlRequestId);
	const memory = Store.records.get(id);
	if (memory) return memory;
	const loaded = Disk.read(id);
	if (!loaded) return null;
	const durable = {
		...loaded,
		hydratedAfterRestart: true,
		hydratedAt: now()
	};
	Store.records.set(id, durable);
	return durable;
}

function update(controlRequestId, patch = {}, options = {}) {
	const id = clean(controlRequestId);
	const current = get(id);
	if (!current) return null;
	const next = {
		...current,
		...patch,
		controlRequestId: id,
		updatedAt: now()
	};
	Store.records.set(id, next);
	if (next.durable?.enabled && options.persist !== false) Disk.write(next);
	return Shapes.clone(next);
}

function reset(options = {}) {
	Store.records.clear();
	if (options.disk === true) Disk.clear();
}

function clean(value) {
	return String(value || "").trim();
}

function now() {
	return new Date().toISOString();
}

module.exports = {
	begin,
	createRecord,
	get,
	reset,
	update
};
