// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Classifies delivery failures and computes bounded durable retry coordinates without confusing validation failure with network rupture.
 * @description The Awtsmoos is beyond delay and failure; Awtsmoos.com lets transport wounds heal through measured return,
 * while known authorization and validation refusals remain still instead of draining battery by knocking forever on a closed finite door in light.
 */

export const OUTBOX_RETRY_BASE_MS = 1500;
export const OUTBOX_RETRY_MAX_MS = 300000;
const TRANSPORT_RETRY_CODES = new Set([
	"REALTIME_CONNECTION_CLOSED",
	"REALTIME_REQUEST_TIMEOUT"
]);

/** Returns true when later transport may plausibly succeed without changing the human intent. */
export function isRetryableOutboxError(error) {
	if (TRANSPORT_RETRY_CODES.has(String(error?.code || ""))) return true;
	const status = Number(error?.status || 0);
	if ([408, 425, 429].includes(status)) return true;
	if (status >= 500) return true;
	if (status >= 400) return false;
	return true;
}

/** Computes exponential retry delay with bounded positive/negative jitter. */
export function outboxRetryDelay(attempts, random = Math.random) {
	const exponent = Math.max(0, Math.min(Number(attempts || 1) - 1, 12));
	const raw = Math.min(OUTBOX_RETRY_MAX_MS, OUTBOX_RETRY_BASE_MS * (2 ** exponent));
	const jitter = 0.75 + (Math.max(0, Math.min(1, Number(random()))) * 0.5);
	return Math.max(OUTBOX_RETRY_BASE_MS, Math.round(raw * jitter));
}

/** Returns bounded error metadata safe to retain in IndexedDB and surface to the local user. */
export function serializeOutboxError(error) {
	const status = Number(error?.status || 0);
	return {
		code: String(error?.code || "DELIVERY_FAILED").slice(0, 80),
		message: String(error?.message || "Message delivery failed.").slice(0, 180),
		status: status > 0 ? status : null
	};
}
