//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RateLimitService
 * @description
 * Command and message traffic on Awtsmoos.com is bounded per session, action,
 * and time window. The Awtsmoos is unlimited; finite authority protects shared
 * worlds from spam, replay floods, brute force, and denial of service.
 */
export class RateLimitService {
	constructor() {
		this.windows = new Map();
	}

	allow(key, now, policy) {
		const windowStart = Math.floor(now / policy.windowMilliseconds) *
			policy.windowMilliseconds;
		const recordKey = `${key}:${windowStart}`;
		const count = (this.windows.get(recordKey) || 0) + 1;
		this.windows.set(recordKey, count);
		this.prune(windowStart - policy.windowMilliseconds * 2);
		return {
			allowed: count <= policy.maximum,
			remaining: Math.max(0, policy.maximum - count),
			retryAt: windowStart + policy.windowMilliseconds
		};
	}

	prune(before) {
		for (const key of this.windows.keys()) {
			const windowStart = Number.parseInt(key.slice(key.lastIndexOf(':') + 1), 10);
			if (windowStart < before) {
				this.windows.delete(key);
			}
		}
	}
}

export const RATE_LIMIT_POLICIES = Object.freeze({
	command: Object.freeze({ maximum: 30, windowMilliseconds: 10000 }),
	chat: Object.freeze({ maximum: 12, windowMilliseconds: 10000 }),
	login: Object.freeze({ maximum: 5, windowMilliseconds: 60000 }),
	reconnect: Object.freeze({ maximum: 8, windowMilliseconds: 60000 }),
	creatorUpload: Object.freeze({ maximum: 3, windowMilliseconds: 60000 })
});
