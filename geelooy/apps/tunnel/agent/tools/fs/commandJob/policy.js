// B"H
const os = require('os');

/**
 * B"H — Wait remains bounded below the relay hard timeout, yet long enough for
 * ordinary one-second commands and close receipts to settle deterministically.
 */
const DEFAULT_PAGE_CHARS = 12000;
const MAX_PAGE_CHARS = 50000;
const STREAM_MAX_BYTES = Number(process.env.AWTSMOOS_COMMAND_STREAM_MAX_BYTES || 5 * 1024 * 1024);
const STORE_MAX_BYTES = Number(process.env.AWTSMOOS_COMMAND_STORE_MAX_BYTES || 50 * 1024 * 1024);
const TTL_MS = Number(process.env.AWTSMOOS_COMMAND_JOB_TTL_MS || 30 * 60 * 1000);
const DEFAULT_HTTP_SAFE_WAIT_MS = 3000;
const MAX_HTTP_SAFE_WAIT_MS = 4500;
const TERMINAL = new Set([
	'completed','failed','timed_out','cancelled','cleanup_failed',
	'stale_lost_worker','identity_unverified'
]);

function boundedPageChars(value) {
	const number = Number(value || DEFAULT_PAGE_CHARS);
	return Math.max(1, Math.min(
		Number.isFinite(number) ? Math.floor(number) : DEFAULT_PAGE_CHARS,
		MAX_PAGE_CHARS
	));
}

function boundedTimeout(value) {
	const number = Number(value || 86400000);
	return Math.max(100, Math.min(Number.isFinite(number) ? number : 120000, 86400000));
}

function waitCapMs() {
	const number = Number(process.env.AWTSMOOS_HTTP_SAFE_WAIT_MS || DEFAULT_HTTP_SAFE_WAIT_MS);
	return Math.max(50, Math.min(
		Number.isFinite(number) ? Math.floor(number) : DEFAULT_HTTP_SAFE_WAIT_MS,
		MAX_HTTP_SAFE_WAIT_MS
	));
}

function defaultShell() {
	return os.platform() === 'win32' ? process.env.ComSpec || 'cmd.exe' : '/bin/sh';
}

function cleanId(value) {
	return String(value || '').replace(/[^a-zA-Z0-9_-]/g, '');
}

module.exports = {
	DEFAULT_PAGE_CHARS,
	MAX_PAGE_CHARS,
	STREAM_MAX_BYTES,
	STORE_MAX_BYTES,
	TTL_MS,
	TERMINAL,
	DEFAULT_HTTP_SAFE_WAIT_MS,
	MAX_HTTP_SAFE_WAIT_MS,
	boundedPageChars,
	boundedTimeout,
	waitCapMs,
	defaultShell,
	cleanId
};
