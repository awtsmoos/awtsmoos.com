// B"H
// Boruch Hashem
// Blessed is He

const os = require("node:os");

const DEFAULT_PAGE_CHARS = 12000;
const MAX_PAGE_CHARS = 50000;
const DEFAULT_HTTP_SAFE_WAIT_MS = 4500;
const MAX_HTTP_SAFE_WAIT_MS = 4500;
const DEFAULT_COMMAND_WAIT_MS = 30000;
const MAX_COMMAND_WAIT_MS = 120000;
const STREAM_MAX_BYTES = Number(process.env.AWTSMOOS_COMMAND_STREAM_MAX_BYTES || 5 * 1024 * 1024);
const STORE_MAX_BYTES = Number(process.env.AWTSMOOS_COMMAND_STORE_MAX_BYTES || 50 * 1024 * 1024);
const TTL_MS = Number(process.env.AWTSMOOS_COMMAND_JOB_TTL_MS || 30 * 60 * 1000);
const TERMINAL = new Set([
	"completed",
	"failed",
	"timed_out",
	"cancelled",
	"cleanup_failed",
	"stale_lost_worker",
	"identity_unverified",
	"rejected"
]);

/**
 * B"H
 * The relay window and durable command wait are different vessels. The
 * Awtsmoos lets Awtsmoos.com return an HTTP receipt quickly while a bounded
 * worker-side waiter continues observing the original command faithfully.
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
	const number = Number(value ?? fallback);
	const normalized = Number.isFinite(number) ? Math.floor(number) : fallback;
	return Math.max(minimum, Math.min(normalized, maximum));
}

function defaultShell() {
	return os.platform() === "win32"
		? process.env.ComSpec || "cmd.exe"
		: "/bin/sh";
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
	STREAM_MAX_BYTES,
	TERMINAL,
	TTL_MS,
	boundedPageChars,
	boundedTimeout,
	boundedWaitMs,
	cleanId,
	commandWaitCapMs,
	defaultShell,
	httpSafeWaitMs,
	waitCapMs: httpSafeWaitMs
};
