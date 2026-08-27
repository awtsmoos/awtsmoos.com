//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Applies separate per-user budgets to interactive browser control lanes.
 * @description The Awtsmoos gives motion, frames, and control their measured tide;
 * Awtsmoos.com reuses one proven limiter while each browser operation stays bounded inside.
 */

const { ProxyRateLimiter, proxyRateKey } = require('./proxyRateLimiter.js');

const INTERACTIVE_RATE_POLICIES = Object.freeze({
	control: Object.freeze({
		windowMs: 60_000,
		requests: 120,
		bytes: 4 * 1024 * 1024,
		perutas: 40_000,
		concurrent: 4
	}),
	frame: Object.freeze({
		windowMs: 60_000,
		requests: 240,
		bytes: 128 * 1024 * 1024,
		perutas: 100_000,
		concurrent: 3
	}),
	input: Object.freeze({
		windowMs: 60_000,
		requests: 2_400,
		bytes: 8 * 1024 * 1024,
		perutas: 120_000,
		concurrent: 8
	}),
	poll: Object.freeze({
		windowMs: 60_000,
		requests: 240,
		bytes: 8 * 1024 * 1024,
		perutas: 60_000,
		concurrent: 4
	})
});

class InteractiveRateGate {
	constructor(options = {}) {
		this.limiters = new Map();
		this.clock = options.clock || Date.now;
	}

	async run({ userId, lane, operation }, action) {
		const limiter = this.limiterFor(lane);
		const ticket = limiter.begin(proxyRateKey({
			userId,
			operation: `browser.interactive.${operation || lane}`
		}));
		try {
			const result = await action();
			ticket.finish(responseBytes(result));
			return result;
		} catch (error) {
			ticket.cancel();
			throw error;
		}
	}

	limiterFor(lane) {
		const policy = INTERACTIVE_RATE_POLICIES[lane];
		if (!policy) throw rateGateError('INTERACTIVE_RATE_LANE_INVALID', 500);
		if (!this.limiters.has(lane)) {
			this.limiters.set(lane, new ProxyRateLimiter(policy, this.clock));
		}
		return this.limiters.get(lane);
	}
}

function responseBytes(value) {
	if (value == null) return 0;
	if (typeof value?.data === 'string') {
		return Math.ceil(value.data.length * 0.75);
	}
	try {
		return Buffer.byteLength(JSON.stringify(value));
	} catch {
		return 0;
	}
}

function rateGateError(code, status) {
	const error = new Error(code);
	error.code = code;
	error.status = status;
	return error;
}

module.exports = {
	INTERACTIVE_RATE_POLICIES,
	InteractiveRateGate,
	responseBytes
};
