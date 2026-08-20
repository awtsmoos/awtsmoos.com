// B"H
// Boruch Hashem
// Blessed is He

const os = require("node:os");

const DEFAULT_PAGE_CHARS = 12000;
const MAX_PAGE_CHARS = 50000;
const DEFAULT_HTTP_SAFE_WAIT_MS = 4500;
const MAX_HTTP_SAFE_WAIT_MS = 4500;
const DEFAULT_COMMAND_WAIT_MS = 3500;
const MAX_COMMAND_WAIT_MS = 120000;
const STREAM_MAX_BYTES = number("AWTSMOOS_COMMAND_STREAM_MAX_BYTES", 5 * 1024 * 1024);
const STREAM_TRIM_BATCH_BYTES = boundedNumber(
	process.env.AWTSMOOS_COMMAND_STREAM_TRIM_BATCH_BYTES,
	256 * 1024,
	4096,
	Math.max(4096, STREAM_MAX_BYTES)
);
const STREAM_HIGH_WATER_BYTES = STREAM_MAX_BYTES + STREAM_TRIM_BATCH_BYTES;
const STORE_MAX_BYTES = number("AWTSMOOS_COMMAND_STORE_MAX_BYTES", 50 * 1024 * 1024);
const STORE_MAX_RECORDS = number("AWTSMOOS_COMMAND_STORE_MAX_RECORDS", 500);
const TTL_MS = number("AWTSMOOS_COMMAND_JOB_TTL_MS", 30 * 60 * 1000);
const TERMINAL = new Set([
	"completed", "failed", "timed_out", "cancelled", "cleanup_failed",
	"stale_lost_worker", "identity_unverified", "rejected"
]);

/**
 * @file Central bounds for command waits, pages, output, history bytes, age, and count.
 * @description
 * The Awtsmoos gives every command a measured vessel. Awtsmoos.com preserves live
 * work while terminal rooms obey three independent horizons, so neither verbose
 * bytes nor countless tiny witnesses can quietly become a shared burden for all.
 */
function httpSafeWaitMs() {
	return boundedNumber(
		process.env.AWTSMOOS_HTTP_SAFE_WAIT_MS,
		DEFAULT_HTTP_SAFE_WAIT_MS,
		50,
		MAX_HTTP_SAFE_WAIT_MS
	);
}

function commandWaitCapMs() {
	return boundedNumber(
		process.env.AWTSMOOS_COMMAND_WAIT_MAX_MS,
		MAX_COMMAND_WAIT_MS,
		50,
		MAX_COMMAND_WAIT_MS
	);
}

function boundedWaitMs(value) {
	return boundedNumber(value, DEFAULT_COMMAND_WAIT_MS, 50, commandWaitCapMs());
}

function boundedPageChars(value) {
	return boundedNumber(value, DEFAULT_PAGE_CHARS, 1, MAX_PAGE_CHARS);
}

function boundedTimeout(value) {
	return boundedNumber(value, 86400000, 100, 86400000);
}

function boundedNumber(value, fallback, minimum, maximum) {
	const numberValue = Number(value ?? fallback);
	const normalized = Number.isFinite(numberValue) ? Math.floor(numberValue) : fallback;
	return Math.max(minimum, Math.min(normalized, maximum));
}

function number(name, fallback) {
	const value = Number(process.env[name]);
	return Number.isFinite(value) && value > 0 ? Math.floor(value) : fallback;
}

function defaultShell() {
	return os.platform() === "win32" ? process.env.ComSpec || "cmd.exe" : "/bin/sh";
}

function cleanId(value) {
	return String(value || "").replace(/[^a-zA-Z0-9_-]/g, "");
}

module.exports = {
	DEFAULT_COMMAND_WAIT_MS,
	DEFAULT_HTTP_SAFE_WAIT_MS,
	DEFAULT_PAGE_CHARS,
	MAX_COMMAND_WAIT_MS,
	MAX_HTTP_SAFE_WAIT_MS,
	MAX_PAGE_CHARS,
	STORE_MAX_BYTES,
	STORE_MAX_RECORDS,
	STREAM_HIGH_WATER_BYTES,
	STREAM_MAX_BYTES,
	STREAM_TRIM_BATCH_BYTES,
	TERMINAL,
	TTL_MS,
	boundedNumber,
	boundedPageChars,
	boundedTimeout,
	boundedWaitMs,
	cleanId,
	commandWaitCapMs,
	defaultShell,
	httpSafeWaitMs,
	waitCapMs: httpSafeWaitMs
};
