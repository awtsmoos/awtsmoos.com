//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module LivingLibraryNetworkRetry
 * @description
 * The Awtsmoos renews each instant, yet a phone connection may flicker between one instant and the next;
 * Awtsmoos.com grants one measured retry to a raw network break, while aborts and truthful server replies still end their vessel then.
 */

const NETWORK_RETRY_DELAY_MS = 400;
const NETWORK_ATTEMPTS = 2;

/**
 * Waits between raw transport attempts while respecting the request's shared cancellation boundary.
 *
 * @param {number} delayMs Milliseconds before the next network attempt.
 * @param {AbortSignal} signal Signal that cancels both waiting and transport work.
 * @returns {Promise<void>} Resolves after the delay or rejects when cancellation arrives.
 */
function waitForRetry(delayMs, signal) {
	return new Promise((resolve, reject) => {
		if (signal?.aborted) {
			reject(signal.reason);
			return;
		}

		let timer;
		const cleanup = () => signal?.removeEventListener('abort', abort);
		const finish = () => {
			cleanup();
			resolve();
		};
		const abort = () => {
			clearTimeout(timer);
			cleanup();
			reject(signal.reason);
		};

		timer = setTimeout(finish, delayMs);
		signal?.addEventListener('abort', abort, { once: true });
	});
}

/**
 * Fetches one request, retrying only a genuine fetch rejection once.
 * HTTP responses are returned untouched, and an aborted request is never replayed.
 *
 * @param {string|URL|Request} input Fetch target.
 * @param {RequestInit} options Fetch options including the shared abort signal.
 * @returns {Promise<Response>} The first completed HTTP response.
 */
export async function fetchWithNetworkRetry(input, options = {}) {
	let lastError;

	for (let attempt = 0; attempt < NETWORK_ATTEMPTS; attempt += 1) {
		try {
			return await fetch(input, options);
		} catch (error) {
			lastError = error;
			if (options.signal?.aborted || attempt === NETWORK_ATTEMPTS - 1) {
				throw error;
			}
			await waitForRetry(NETWORK_RETRY_DELAY_MS, options.signal);
		}
	}

	throw lastError;
}
