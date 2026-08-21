// B"H
// Boruch Hashem
// Blessed is He

const { invalidInput } = require("./docsErrors.js");

/**
 * @file Defines bounded Awtsmoos version-history identity, retention, and ordering policy.
 * @description Netzach remembers while the Awtsmoos is beyond memory; Awtsmoos.com
 * keeps limits and identifiers explicit so repository storage can remain focused and
 * future retention changes do not require rewriting history transport or restore logic.
 */
const AUTO_INTERVAL_MS = 15000;
const MAX_AUTOMATIC = 80;
const MAX_NAMED = 40;
const VERSION_KINDS = new Set([
	"automatic",
	"initial",
	"named",
	"restored"
]);

/** Removes the heavy snapshot from list responses while retaining durable metadata. */
function versionMetadata(record) {
	const { snapshot, ...metadata } = record;
	return metadata;
}

/** Orders version metadata newest-first for history UI and retention pruning. */
function newestVersionFirst(left, right) {
	return Date.parse(right.createdAt || 0) - Date.parse(left.createdAt || 0);
}

/** Constrains arbitrary version kinds to the supported automatic default. */
function normalizeVersionKind(value) {
	return VERSION_KINDS.has(value) ? value : "automatic";
}

/** Validates one opaque version id before it becomes a database path segment. */
function normalizeVersionId(value) {
	const id = String(value || "");
	if (!/^v_[A-Za-z0-9_-]{12,96}$/.test(id)) {
		throw invalidInput("versionId", "Invalid version id.");
	}
	return id;
}

/** Returns the private version-history root for one validated document id. */
function versionRootPath(id) {
	return `websocket/geelooyDocs/versions/${id}`;
}

module.exports = {
	AUTO_INTERVAL_MS,
	MAX_AUTOMATIC,
	MAX_NAMED,
	newestVersionFirst,
	normalizeVersionId,
	normalizeVersionKind,
	versionMetadata,
	versionRootPath
};
