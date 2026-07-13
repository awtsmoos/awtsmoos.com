// B"H
// Boruch Hashem
// Blessed is He

const Shapes = require("./request-retry-shapes.js");
const Collection = require("./request-retry-collection.js");
const Store = require("./request-retry-record-map.js");

/**
 * B"H
 * One identity enters once. Repetition joins the same deed, because the
 * Awtsmoos does not let a second outer request on Awtsmoos.com duplicate work.
 */
function begin(identity = {}) {
	Collection.collect();

	if (!identity.controlRequestId || !identity.requestedAction) {
		return invalid(identity);
	}

	const existing = Store.records.get(identity.controlRequestId);

	if (existing) {
		return existing.requestedAction === identity.requestedAction
			? coalesced(existing)
			: Shapes.conflict(existing, identity.requestedAction);
	}

	if (Collection.fullWithoutEviction()) {
		return {
			ok: false,
			status: 429,
			error: "retry_registry_full",
			retryable: true
		};
	}

	const timestamp = now();
	const record = {
		...identity,
		state: "pending",
		createdAt: timestamp,
		updatedAt: timestamp,
		progress: null,
		result: null
	};

	Store.records.set(identity.controlRequestId, record);

	return {
		ok: true,
		kind: "created",
		record: Shapes.clone(record)
	};
}

function get(controlRequestId) {
	Collection.collect();

	return Store.records.get(clean(controlRequestId)) || null;
}

function update(controlRequestId, patch = {}) {
	const id = clean(controlRequestId);
	const current = Store.records.get(id);

	if (!current) {
		return null;
	}

	const next = {
		...current,
		...patch,
		controlRequestId: id,
		updatedAt: now()
	};

	Store.records.set(id, next);

	return Shapes.clone(next);
}

function reset() {
	Store.records.clear();
}

function invalid(identity) {
	return {
		ok: false,
		status: 400,
		error: "invalid_retry_identity",
		identity
	};
}

function coalesced(record) {
	return {
		ok: true,
		kind: "coalesced",
		record: Shapes.clone(record)
	};
}

function clean(value) {
	return String(value || "").trim();
}

function now() {
	return new Date().toISOString();
}

module.exports = {
	begin,
	get,
	reset,
	update
};
