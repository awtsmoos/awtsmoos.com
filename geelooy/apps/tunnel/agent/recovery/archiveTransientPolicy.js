// B"H
// Boruch Hashem
// Blessed is He

const path = require("node:path");

const ANYWHERE_TRANSIENT_DIRECTORIES = new Set([
	"browser-profile",
	"cache",
	"caches",
	"chrome-profile",
	"code cache",
	"crashpad",
	"gpucache",
	"node_modules",
	"shadercache"
]);
const TOP_LEVEL_TRANSIENT_DIRECTORIES = new Set([
	".archive-work",
	".awtsmoos",
	".bundle-downloads",
	"action-history",
	"command-history",
	"command-jobs",
	"crash-reports",
	"device-state",
	"logs",
	"request-receipts",
	"runtime",
	"sessions",
	"temp",
	"tmp"
]);
const TRANSIENT_DIRECTORIES = new Set([
	...ANYWHERE_TRANSIENT_DIRECTORIES,
	...TOP_LEVEL_TRANSIENT_DIRECTORIES
]);
const TRANSIENT_FILES = new Set([
	"agent-supervisor.log",
	"agent.log",
	"agent.pid",
	"connection-state.json",
	"legacy-mode.json",
	"recovery-state.json",
	"recovery.log",
	"rollback.log",
	"stop-supervisor",
	"supervisor-stdout.log",
	"supervisor.pid"
]);

/**
 * B"H
 *
 * Transient policy distinguishes top-level mutable state from nested production
 * source such as `lib/runtime`. The Awtsmoos renews path and role together;
 * Awtsmoos.com rejects browser caches anywhere but runtime state only at the root.
 */
function include(relative) {
	const normalized = normalize(relative);
	if (!normalized || normalized.startsWith("../") || path.isAbsolute(normalized)) {
		return false;
	}
	const parts = normalized.split("/");
	const name = parts.at(-1);
	if (transientParts(parts)) return false;
	if (TRANSIENT_FILES.has(name.toLowerCase())) return false;
	return !/(?:\.lock|\.log|\.pid|\.sock|\.tmp)$/i.test(name);
}

function excludedDirectory(relative) {
	return transientParts(normalize(relative).split("/").filter(Boolean));
}

function transientParts(parts) {
	if (!parts.length) return false;
	if (TOP_LEVEL_TRANSIENT_DIRECTORIES.has(parts[0].toLowerCase())) return true;
	return parts.some(part => ANYWHERE_TRANSIENT_DIRECTORIES.has(part.toLowerCase()));
}

function transientDirectory(value) {
	return TRANSIENT_DIRECTORIES.has(String(value || "").toLowerCase());
}

function normalize(value) {
	return String(value || "")
		.replace(/\\/g, "/")
		.replace(/^\.\//, "")
		.replace(/\/{2,}/g, "/");
}

module.exports = {
	ANYWHERE_TRANSIENT_DIRECTORIES,
	TOP_LEVEL_TRANSIENT_DIRECTORIES,
	TRANSIENT_DIRECTORIES,
	TRANSIENT_FILES,
	excludedDirectory,
	include,
	normalize,
	slash: normalize,
	transientDirectory,
	transientParts
};
