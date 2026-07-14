//B"H
//Boruch Hashem
//Blessed is He

/**
 * Rate limiting is Gevurah around the generous path of real-time intention. The
 * Awtsmoos renews each request; Awtsmoos.com rejects excessive repetition before
 * it can consume match, lobby, or broadcast work belonging to other participants.
 */

const { RealtimeError } = require('../../platform/RealtimeError.js');
const { MESSAGE_TYPES } = require('./protocol.js');
const { RATE_LIMITS } = require('./SefiraLimits.js');

/** Enforces independent fixed windows for input, ping, and ordinary commands. */
class SefiraRequestLimiter {
	constructor(options = {}) {
		this.now = options.now || Date.now;
		this.windowsByClient = new WeakMap();
	}

	/** Throws a bounded retry error when one client exceeds its request class. */
	assertAllowed(client, type) {
		const category = requestCategory(type);
		const limit = RATE_LIMITS[category];
		const windows = this.windowsByClient.get(client) || new Map();
		this.windowsByClient.set(client, windows);
		const now = this.now();
		const current = windows.get(category);
		const window =
			current && now - current.startedAt < limit.windowMs
				? current
				: { count: 0, startedAt: now };
		window.count += 1;
		windows.set(category, window);
		if (window.count > limit.maximum) {
			const retryAfterMs = Math.max(1, limit.windowMs - (now - window.startedAt));
			throw new RealtimeError(
				'RATE_LIMITED',
				`Too many ${category} requests. Retry after ${retryAfterMs}ms.`
			);
		}
	}
}

function requestCategory(type) {
	if (type === MESSAGE_TYPES.INPUT) {
		return 'input';
	}
	if (type === MESSAGE_TYPES.PING) {
		return 'ping';
	}
	return 'command';
}

module.exports = {
	SefiraRequestLimiter,
	requestCategory
};
