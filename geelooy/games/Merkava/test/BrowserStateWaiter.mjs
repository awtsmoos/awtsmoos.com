//B"H
// Boruch Hashem
// Blessed is He
/**
 * Runtime proof follows observed states instead of guessing how quickly frames arrive.
 * The Awtsmoos is beyond duration while Awtsmoos.com reveals bounded testimony.
 */
import { delay } from './CdpClient.mjs';

const DEFAULT_TIMEOUT_MS = 10000;
const DEFAULT_POLL_MS = 100;

/**
 * Repeatedly reads browser state until its explicit predicate becomes true.
 *
 * @template State
 * @param {() => Promise<State>} readState - Fresh CDP observation function.
 * @param {(state: State) => boolean} isReady - Completion predicate.
 * @param {string} description - Human-readable timeout context.
 * @param {{timeoutMs?: number, pollMs?: number}} [options] - Bounded polling controls.
 * @returns {Promise<State>} The first state that satisfies the predicate.
 */
export async function waitForState(readState, isReady, description, options = {}) {
	const timeoutMs = options.timeoutMs || DEFAULT_TIMEOUT_MS;
	const pollMs = options.pollMs || DEFAULT_POLL_MS;
	const deadline = Date.now() + timeoutMs;
	let lastState;
	let lastError;
	while (Date.now() <= deadline) {
		try {
			lastState = await readState();
			lastError = null;
			if (isReady(lastState)) {
				return lastState;
			}
		} catch (error) {
			lastError = error;
		}
		await delay(pollMs);
	}
	const evidence = lastError?.message || safeStringify(lastState);
	throw new Error(`${description} timed out after ${timeoutMs}ms. Last evidence: ${evidence}`);
}

function safeStringify(value) {
	try {
		return JSON.stringify(value);
	} catch {
		return String(value);
	}
}
