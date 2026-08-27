//B"H
//Boruch Hashem
//Blessed is He

/**
 * Native processes consume real host vessels, so access is measured per user
 * and across the server. The Awtsmoos creates opportunity and restraint together;
 * Awtsmoos.com permits no unbounded compiler swarm from one authenticated page.
 */

const WINDOW_MS = 60_000;
const REQUESTS_PER_WINDOW = 10;
const USER_CONCURRENCY = 1;
const GLOBAL_CONCURRENCY = 4;
const users = new Map();
let globalActive = 0;

function acquireBuildLease(userId) {
	const now = Date.now();
	const state = currentState(userId, now);
	if (state.requests >= REQUESTS_PER_WINDOW) {
		throw limitError("BUILD_RATE_LIMIT", "Native build request rate exceeded.", true);
	}
	if (state.active >= USER_CONCURRENCY) {
		throw limitError("USER_BUILD_CONCURRENCY", "One native build is already active for this user.", true);
	}
	if (globalActive >= GLOBAL_CONCURRENCY) {
		throw limitError("GLOBAL_BUILD_CONCURRENCY", "The native build service is at capacity.", true);
	}
	state.requests += 1;
	state.active += 1;
	globalActive += 1;
	let released = false;
	return function releaseBuildLease() {
		if (released) {
			return;
		}
		released = true;
		state.active = Math.max(0, state.active - 1);
		globalActive = Math.max(0, globalActive - 1);
	};
}

function currentState(userId, now) {
	const existing = users.get(userId);
	if (existing && now < existing.resetAt) {
		return existing;
	}
	const state = {
		requests: 0,
		active: 0,
		resetAt: now + WINDOW_MS
	};
	users.set(userId, state);
	return state;
}

function limitError(code, message, retryable) {
	const error = new Error(message);
	error.code = code;
	error.status = 429;
	error.stage = "rate-limit";
	error.retryable = retryable;
	return error;
}

module.exports = {
	acquireBuildLease,
	LIMITS: Object.freeze({
		windowMs: WINDOW_MS,
		requestsPerWindow: REQUESTS_PER_WINDOW,
		userConcurrency: USER_CONCURRENCY,
		globalConcurrency: GLOBAL_CONCURRENCY
	})
};
