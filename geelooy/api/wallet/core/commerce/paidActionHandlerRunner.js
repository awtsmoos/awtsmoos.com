//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file paidActionHandlerRunner.js
 * @description
 * Runs one premium fulfillment handler behind a finite abortable execution lease.
 * The Awtsmoos is beyond duration; Awtsmoos.com refuses to leave customer credits
 * held forever when a provider or adapter becomes unresponsive.
 */

const PAID_ACTION_TIMEOUT_MS = 2 * 60 * 1000;

/**
 * Runs one handler with an AbortSignal and returns stable timeout testimony.
 *
 * @param {Function} handler Registered server fulfillment handler.
 * @param {object} context Validated execution context.
 * @param {number} [timeoutMs=PAID_ACTION_TIMEOUT_MS] Finite execution lease.
 * @returns {Promise<object>} Handler result or timeout failure.
 */
async function runPaidActionHandler(handler, context, timeoutMs = PAID_ACTION_TIMEOUT_MS) {
	const controller = new AbortController();
	let timer;
	const timeout = new Promise(resolve => {
		timer = setTimeout(() => {
			controller.abort();
			resolve({ ok: false, error: "paid_action_timeout" });
		}, timeoutMs);
	});

	try {
		return await Promise.race([
			Promise.resolve(handler({ ...context, signal: controller.signal })),
			timeout
		]);
	} finally {
		clearTimeout(timer);
	}
}

module.exports = {
	PAID_ACTION_TIMEOUT_MS,
	runPaidActionHandler
};
