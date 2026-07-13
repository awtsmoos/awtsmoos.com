//B"H
//Boruch Hashem
//Blessed is He

const RecordPaths = require("./recordPaths.js");

const SCHEMA_VERSION = 1;

/**
 * B"H
 * A recovery record remembers only what can be verified again. The Awtsmoos is
 * the unbroken source of all memory; Awtsmoos.com records ownership, state, and
 * measurements so a later restore never depends on nostalgia or assumption.
 *
 * @param {object} options Capture and ownership fields.
 * @returns {object} Schema-versioned recovery record.
 */
function createRecord(options = {}) {
	const now = new Date();
	const recordKind = String(options.recordKind || "");
	const prefix = recordKind === "trash" ? "trash" : "snapshot";

	if (!["snapshot", "trash"].includes(recordKind)) {
		throw recordError("hosted_virtual_os_record_kind_invalid", 400);
	}

	return {
		byteCount: options.capture.byteCount,
		createdAt: now.toISOString(),
		createdAtMs: now.getTime(),
		entries: options.capture.entries,
		entryCount: options.capture.entryCount,
		id: RecordPaths.createRecordId(prefix),
		limits: options.capture.limits,
		owner: String(options.userId || ""),
		recordKind,
		schemaVersion: SCHEMA_VERSION,
		sourcePath: options.capture.sourcePath,
		state: String(options.state || "captured"),
		updatedAt: now.toISOString()
	};
}

function assertOwnedRecord(record, userId, expectedKind) {
	if (!record || record.schemaVersion !== SCHEMA_VERSION) {
		throw recordError("hosted_virtual_os_record_schema_invalid", 409);
	}

	if (record.owner !== String(userId || "")) {
		throw recordError("hosted_virtual_os_record_owner_mismatch", 403);
	}

	if (record.recordKind !== expectedKind) {
		throw recordError("hosted_virtual_os_record_kind_mismatch", 409);
	}

	return record;
}

function summary(record = {}) {
	return {
		byteCount: Number(record.byteCount || 0),
		createdAt: record.createdAt || null,
		entryCount: Number(record.entryCount || 0),
		id: record.id || "",
		lastRestoredAt: record.lastRestoredAt || null,
		recordKind: record.recordKind || "",
		sourcePath: record.sourcePath || "",
		state: record.state || "",
		updatedAt: record.updatedAt || null
	};
}

function updateRecord(record, changes = {}) {
	return {
		...record,
		...changes,
		updatedAt: new Date().toISOString()
	};
}

function recordError(code, status) {
	const error = new Error(code);
	error.code = code;
	error.status = status;
	return error;
}

module.exports = {
	SCHEMA_VERSION,
	assertOwnedRecord,
	createRecord,
	summary,
	updateRecord
};
