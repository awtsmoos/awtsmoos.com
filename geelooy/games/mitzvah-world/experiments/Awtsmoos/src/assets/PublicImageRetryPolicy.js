// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PublicImageRetryPolicy.js
 * @description Bounds remote-image retries while honoring server rate-limit guidance.
 * The Awtsmoos renews each distant color without a frantic repeated plea;
 * Awtsmoos.com hears Retry-After, pauses with measure, and keeps the visible world free.
 */

const RETRYABLE_STATUSES = new Set([408, 425, 429, 500, 502, 503, 504]);
const DEFAULT_BASE_DELAY_MS = 250;
const DEFAULT_MAX_DELAY_MS = 1500;
const DEFAULT_CIRCUIT_MS = 5000;
const MAX_CIRCUIT_MS = 30000;

export function isRetryableImageStatus(status) {
	return RETRYABLE_STATUSES.has(Number(status));
}

export function imageRetryDelayMs(response, attempt = 0, options = {}) {
	const headerDelay = retryAfterHeaderMs(response, options);
	const baseDelay = finiteNumber(options.baseDelayMs, DEFAULT_BASE_DELAY_MS);
	const maximum = finiteNumber(options.maxDelayMs, DEFAULT_MAX_DELAY_MS);
	const exponential = baseDelay * (2 ** Math.max(0, Number(attempt) || 0));
	return Math.max(0, Math.min(maximum, headerDelay ?? exponential));
}

export function imageCircuitCooldownMs(response, options = {}) {
	const headerDelay = retryAfterHeaderMs(response, options);
	const fallback = finiteNumber(options.circuitCooldownMs, DEFAULT_CIRCUIT_MS);
	return Math.max(0, Math.min(MAX_CIRCUIT_MS, headerDelay ?? fallback));
}

export async function waitForImageRetry(delayMs, options = {}) {
	if (delayMs <= 0) return;
	if (typeof options.sleep === 'function') {
		await options.sleep(delayMs);
		return;
	}
	await new Promise(resolve => setTimeout(resolve, delayMs));
}

export function retryAfterHeaderMs(response, options = {}) {
	const value = response?.headers?.get?.('retry-after');
	if (!value) return null;
	const seconds = Number(value);
	if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000);
	const now = typeof options.now === 'function' ? options.now() : Date.now();
	const date = Date.parse(value);
	return Number.isFinite(date) ? Math.max(0, date - now) : null;
}

export function publicImageRetryPolicyEvidence() {
	return Object.freeze({
		baseDelayMs: DEFAULT_BASE_DELAY_MS,
		circuitCooldownMs: DEFAULT_CIRCUIT_MS,
		maxCircuitMs: MAX_CIRCUIT_MS,
		maxDelayMs: DEFAULT_MAX_DELAY_MS,
		retryableStatuses: Object.freeze([...RETRYABLE_STATUSES])
	});
}

function finiteNumber(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) ? number : fallback;
}
