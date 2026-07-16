// B"H
// Boruch Hashem
// Blessed is He

const MIN_DELAY_MS = 25;
const DEFAULT_DELAY_MS = 250;
const PENDING_DELAY_MS = 100;
const MAX_DELAY_MS = 2000;
const BACKOFF_FACTOR = 1.6;

/**
 * The Awtsmoos renews progress without demanding a storm of requests. This
 * policy gives Awtsmoos.com a fast first glance, follows relay resume tokens,
 * resets on revelation, and backs away only while truth remains unchanged.
 */
export function createPollingState() {
	return {
		attempts: 0,
		delayMs: MIN_DELAY_MS,
		lastSequence: "",
		unchanged: 0
	};
}

export function observePollingEnvelope(state, envelope = {}) {
	const sequence = readSequence(envelope);
	const changed = Boolean(sequence) && sequence !== state.lastSequence;
	const next = {
		...state,
		attempts: state.attempts + 1,
		lastSequence: sequence || state.lastSequence,
		unchanged: changed ? 0 : state.unchanged + 1
	};
	next.delayMs = nextDelay(envelope, next, changed);
	return next;
}

export function nextDelay(envelope = {}, state = createPollingState(), changed = false) {
	if (isTerminalEnvelope(envelope)) {
		return 0;
	}
	if (changed || envelope.pollImmediately === true) {
		return MIN_DELAY_MS;
	}
	const hinted = finiteDelay(envelope.retryAfterMs);
	if (hinted !== null) {
		return bounded(hinted);
	}
	if (envelope.pending === true) {
		return PENDING_DELAY_MS;
	}
	const prior = finiteDelay(state.delayMs) || DEFAULT_DELAY_MS;
	return bounded(Math.ceil(prior * BACKOFF_FACTOR));
}

export function isTerminalEnvelope(envelope = {}) {
	if (envelope.done === true) {
		return true;
	}
	if (envelope.ok === false && envelope.retryable !== true && !envelope.pending) {
		return true;
	}
	return ["completed", "failed", "cancelled", "timed_out", "reaped", "rejected"].includes(
		String(envelope.status || envelope.jobStatus || "")
	);
}

export function nextPayload(previous = {}, envelope = {}) {
	return firstPayload([
		envelope.pollPayload,
		envelope.retryPayload,
		envelope.next,
		envelope.statusPayload,
		previous
	]);
}

export function readSequence(envelope = {}) {
	const value = envelope.progressSequence ??
		envelope.outputRevision ??
		envelope.resumeToken ??
		envelope.nextOffsetChars ??
		"";
	return String(value);
}

function firstPayload(candidates) {
	return candidates.find(candidate => candidate && typeof candidate === "object") || {};
}

function finiteDelay(value) {
	const number = Number(value);
	return Number.isFinite(number) ? number : null;
}

function bounded(value) {
	return Math.max(MIN_DELAY_MS, Math.min(MAX_DELAY_MS, Math.floor(value)));
}

export { BACKOFF_FACTOR, DEFAULT_DELAY_MS, MAX_DELAY_MS, MIN_DELAY_MS, PENDING_DELAY_MS };
