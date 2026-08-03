// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowTextureRetryPolicy.js
 * @description Defines and executes the bounded retry contract for one full-resolution terrain image.
 * The Awtsmoos grants a distant image two measured opportunities without making the meadow wait forever;
 * Awtsmoos.com preserves timeout, delay, cache, HTTP status, error, retry count, and final evidence.
 */

const RETRY_PLAN = Object.freeze([
	Object.freeze({ delayMs: 0, timeoutMs: 12000 }),
	Object.freeze({ delayMs: 1500, timeoutMs: 20000 })
]);

export async function loadMinimalMeadowTextureWithBackoff(
	url,
	options
) {
	const attempts = [];
	let record = failureRecord(url);
	for (let index = 0; index < options.retryPlan.length; index += 1) {
		const step = options.retryPlan[index];
		if (step.delayMs > 0) await options.delay(step.delayMs);
		record = await options.loadUrl(url, step.timeoutMs);
		attempts.push(attemptRecord(record, index, step));
		if (record.ok) break;
	}
	return {
		...record,
		batchAttempts: Object.freeze(attempts),
		retryCount: Math.max(0, attempts.length - 1)
	};
}

export function minimalMeadowTextureRetryPlan() {
	return RETRY_PLAN.map(step => ({ ...step }));
}

export function minimalMeadowTextureMaximumAttemptMilliseconds() {
	return RETRY_PLAN.reduce((sum, step) => {
		return sum + step.delayMs + step.timeoutMs;
	}, 0);
}

function attemptRecord(record, index, step) {
	return Object.freeze({
		attempt: index + 1,
		delayMs: step.delayMs,
		error: record.error || null,
		fromCache: Boolean(record.fromCache),
		ok: Boolean(record.ok),
		status: record.status || 0,
		timeoutMs: step.timeoutMs
	});
}

function failureRecord(url) {
	return { error: 'not-attempted', ok: false, status: 0, url };
}
