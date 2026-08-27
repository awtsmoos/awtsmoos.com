//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ProxyRateLimiter
 * @description
 * The Awtsmoos measures requests, bytes, perutas, and simultaneous work per user.
 * Awtsmoos.com keeps the hard budget above project and jar identities, so creating
 * another project name or cookie jar can never mint a fresh cloud allowance.
 */

const DEFAULT_LIMITS = Object.freeze({
	windowMs: 60_000,
	requests: 120,
	bytes: 32 * 1024 * 1024,
	perutas: 40_000,
	concurrent: 4
});

class ProxyRateLimiter {
	constructor(limits = {}, clock = Date.now) {
		this.limits = { ...DEFAULT_LIMITS, ...limits };
		this.clock = clock;
		this.states = new Map();
	}

	begin(key, prechargePerutas = 0) {
		const now = this.clock();
		const state = this.currentState(key, now);
		assertWindowBudget(state, this.limits, prechargePerutas, now);
		state.requests += 1;
		state.perutas += prechargePerutas;
		state.concurrent += 1;
		let settled = false;
		return {
			remainingRequests: Math.max(this.limits.requests - state.requests, 0),
			remainingBytes: Math.max(this.limits.bytes - state.bytes, 0),
			remainingPerutas: Math.max(this.limits.perutas - state.perutas, 0),
			finish: (bytes, perutas = 0) => {
				if (settled) return;
				settled = true;
				state.concurrent = Math.max(state.concurrent - 1, 0);
				state.bytes += Math.max(Number(bytes) || 0, 0);
				state.perutas += Math.max(Number(perutas) || 0, 0);
			},
			cancel: () => {
				if (settled) return;
				settled = true;
				state.concurrent = Math.max(state.concurrent - 1, 0);
			}
		};
	}

	currentState(key, now) {
		let state = this.states.get(key);
		if (!state || now >= state.resetAt) {
			state = {
				requests: 0,
				bytes: 0,
				perutas: 0,
				concurrent: 0,
				resetAt: now + this.limits.windowMs
			};
			this.states.set(key, state);
		}
		return state;
	}
}

function assertWindowBudget(state, limits, precharge, now) {
	if (state.requests >= limits.requests) throw rateError(state, limits, now, 'requests');
	if (state.bytes >= limits.bytes) throw rateError(state, limits, now, 'bytes');
	if (state.perutas + precharge > limits.perutas) throw rateError(state, limits, now, 'perutas');
	if (state.concurrent >= limits.concurrent) throw limitedError(1000, 'concurrent');
}

function proxyRateKey({ userId, operation = 'browser.fetch' }) {
	if (!userId) throw new Error('PROXY_USER_REQUIRED');
	return `${userId}:${operation}`;
}

function rateError(state, limits, now, violated) {
	return limitedError(Math.max(state.resetAt - now, 1), violated, limits);
}

function limitedError(retryAfterMs, violated, policy) {
	const error = new Error('PROXY_RATE_LIMITED');
	error.code = 'PROXY_RATE_LIMITED';
	error.status = 429;
	error.retryAfterMs = retryAfterMs;
	error.retryAfterSeconds = Math.max(Math.ceil(retryAfterMs / 1000), 1);
	error.violated = violated;
	error.policy = policy || null;
	return error;
}

module.exports = {
	DEFAULT_LIMITS,
	ProxyRateLimiter,
	proxyRateKey
};
