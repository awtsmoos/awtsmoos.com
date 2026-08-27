// B"H
// Boruch Hashem
// Blessed is He

import {
	createPollingState,
	isTerminalEnvelope,
	nextPayload,
	observePollingEnvelope
} from "./pollingPolicy.js";

/**
 * Each request returns one truthful instant, then yields. The Awtsmoos creates
 * the next instant only when it arrives; Awtsmoos.com follows with cancellation,
 * a finite deadline, cursor continuity, resume tokens, and adaptive delay.
 */
export async function pollUntilTerminal(request, initialPayload = {}, options = {}) {
	const clock = options.clock || Date.now;
	const sleep = options.sleep || defaultSleep;
	const timeoutMs = boundedTimeout(options.timeoutMs);
	const startedAt = clock();
	let payload = initialPayload;
	let state = createPollingState();
	let envelope = null;

	while (clock() - startedAt <= timeoutMs) {
		throwIfAborted(options.signal);
		envelope = await request(payload);
		state = observePollingEnvelope(state, envelope);
		options.onEnvelope?.(envelope, state);
		if (isTerminalEnvelope(envelope)) {
			return result(envelope, state, startedAt, clock());
		}
		payload = nextPayload(payload, envelope);
		throwIfAborted(options.signal);
		await sleep(state.delayMs, options.signal);
	}

	return {
		ok: false,
		error: "client_poll_timeout",
		done: true,
		lastEnvelope: envelope,
		attempts: state.attempts,
		durationMs: clock() - startedAt
	};
}

function result(envelope, state, startedAt, finishedAt) {
	return {
		...envelope,
		pollAttempts: state.attempts,
		pollDurationMs: Math.max(0, finishedAt - startedAt)
	};
}

function boundedTimeout(value) {
	const requested = Number(value);
	return Number.isFinite(requested)
		? Math.max(100, Math.min(requested, 24 * 60 * 60 * 1000))
		: 5 * 60 * 1000;
}

function throwIfAborted(signal) {
	if (signal?.aborted) {
		throw signal.reason || abortError();
	}
}

function defaultSleep(milliseconds, signal) {
	return new Promise((resolve, reject) => {
		const finish = callback => {
			signal?.removeEventListener("abort", abort);
			callback();
		};
		const timer = setTimeout(() => finish(resolve), milliseconds);
		const abort = () => {
			clearTimeout(timer);
			finish(() => reject(signal.reason || abortError()));
		};
		signal?.addEventListener("abort", abort, { once: true });
	});
}

function abortError() {
	const error = new Error("Polling aborted");
	error.name = "AbortError";
	return error;
}
