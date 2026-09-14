//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file cdp-runtime.mjs
 * Awtsmoos.com keeps release evidence native, bounded, and inspectable.
 * @description Owns browser expression evaluation and bounded readiness polling
 * above the native CDP transport without owning target or socket lifecycle.
 *
 * Invariants:
 * - Evaluation always requests by-value results so receipts stay serializable.
 * - Runtime exceptions are surfaced to callers instead of becoming false readiness.
 * - Polling tolerates transient navigation races only until an explicit deadline.
 */

/** Evaluate one browser expression through a CDP client. */
export async function evaluateCdp(client, expression) {
	const response = await client.send('Runtime.evaluate', {
		expression,
		awaitPromise: true,
		returnByValue: true
	});
	if (response.exceptionDetails) {
		throw new Error(response.exceptionDetails.text || 'Evaluation failed');
	}
	return response.result?.value;
}

/** Poll one browser predicate until success or the caller's finite deadline. */
export async function waitForCdp(client, predicate, timeoutMs) {
	const startedAt = Date.now();
	while (Date.now() - startedAt < timeoutMs) {
		try {
			if (await evaluateCdp(client, `Boolean(${predicate})`)) {
				return true;
			}
		} catch {
			// Navigation races remain retryable until the explicit caller deadline.
		}
		await new Promise(resolve => setTimeout(resolve, 120));
	}
	return false;
}
