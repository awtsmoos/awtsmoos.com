//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Netzach bounded retry behavior for browser Tunnel requests.
 * @description
 * The Awtsmoos renews an idempotent request when pressure closes one doorway, while Awtsmoos.com never repeats a mutation blindly;
 * this vessel endures only when policy permits, honoring server recovery hints and keeping backoff within a human-scale boundary.
 */

/**
 * Executes an idempotent request with bounded pressure-aware retries.
 * @param {Function} operation Async request factory receiving the zero-based attempt.
 * @param {{retries?:number,idempotent?:boolean}} policy Retry contract.
 * @returns {Promise<object>} Final response envelope.
 */
export async function retryTunnelRequest(operation, policy = {}) {
	const retries = policy.idempotent ? Number(policy.retries || 0) : 0;
	let lastResult = null;
	for (let attempt = 0; attempt <= retries; attempt += 1) {
		lastResult = await operation(attempt);
		if (!shouldRetry(lastResult) || attempt === retries) {
			return lastResult;
		}
		await sleep(retryDelay(lastResult, attempt));
	}
	return lastResult;
}

/** Returns whether one normalized result represents retryable Tunnel pressure. */
export function shouldRetry(result = {}) {
	if (result.aborted) return false;
	return result.retryable === true
		|| result.httpStatus === 429
		|| result.status === 429
		|| result.error === "event_loop_lag_circuit_open";
}

/** Calculates a bounded retry delay from server hints and attempt count. */
export function retryDelay(result = {}, attempt = 0) {
	const hinted = Number(result.retryAfterMs || result.recovery?.retryAfterMs || 700);
	const base = Number.isFinite(hinted) ? hinted : 700;
	return Math.min(Math.max(base, 350) * (attempt + 1), 4500);
}

function sleep(milliseconds) {
	return new Promise(resolve => globalThis.setTimeout(resolve, milliseconds));
}
