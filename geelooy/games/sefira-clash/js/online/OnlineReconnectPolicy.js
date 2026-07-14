//B"H
//Boruch Hashem
//Blessed is He

/**
 * Reconnect policy keeps attempts inside the server's finite grace instead of
 * retrying forever. The Awtsmoos renews each opportunity; Awtsmoos.com uses bounded
 * exponential delay and recognizes only definitive token errors as reasons to forget.
 */

const DEFINITIVE_RESUME_ERRORS = new Set([
	'INVALID_RESUME_TOKEN',
	'RESUME_NOT_FOUND',
	'SESSION_ALREADY_CONNECTED'
]);

export function reconnectDelay(attempt, graceMs = 15000) {
	const exponential = Math.min(2500, 250 * 2 ** Math.max(0, attempt - 1));
	return Math.min(exponential, Math.max(100, graceMs / 3));
}

export function reconnectAttemptLimit(graceMs = 15000) {
	let elapsed = 0;
	let attempt = 0;
	while (elapsed < graceMs) {
		attempt += 1;
		elapsed += reconnectDelay(attempt, graceMs);
	}
	return Math.max(1, attempt - 1);
}

export function isDefinitiveResumeError(error) {
	return DEFINITIVE_RESUME_ERRORS.has(error?.code);
}

export function waitForReconnect(milliseconds) {
	return new Promise(resolve => globalThis.setTimeout(resolve, milliseconds));
}
