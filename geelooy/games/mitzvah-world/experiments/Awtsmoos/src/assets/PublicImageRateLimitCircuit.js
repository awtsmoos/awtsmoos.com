// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PublicImageRateLimitCircuit.js
 * @description Remembers retryable image responses for a bounded, inspectable cooldown.
 * The Awtsmoos keeps the guarded gate known while procedural color remains bright;
 * Awtsmoos.com avoids repeated knocks until the server reopens the light.
 */

import { clonePublicImageResponse } from './PublicImageResponseClone.js';
import { imageCircuitCooldownMs } from './PublicImageRetryPolicy.js';

const circuitByUrl = new Map();

export function activePublicImageCircuit(url, options = {}) {
	const entry = circuitByUrl.get(url);
	if (!entry) return null;
	if (entry.until > currentTime(options)) {
		return {
			response: clonePublicImageResponse(entry.response),
			retryAfterMs: entry.until - currentTime(options)
		};
	}
	circuitByUrl.delete(url);
	return null;
}

export function publicImageCircuitIsOpen(url, options = {}) {
	return Boolean(activePublicImageCircuit(url, options));
}

export function rememberPublicImageCircuit(url, response, options = {}) {
	circuitByUrl.set(url, {
		response: clonePublicImageResponse(response),
		until: currentTime(options) + imageCircuitCooldownMs(response, options)
	});
}

export function clearPublicImageCircuit(url) {
	if (url) {
		circuitByUrl.delete(url);
		return;
	}
	circuitByUrl.clear();
}

export function publicImageCircuitStats(options = {}) {
	const timestamp = currentTime(options);
	return {
		open: [...circuitByUrl.values()].filter(entry => entry.until > timestamp).length
	};
}

function currentTime(options) {
	return typeof options.now === 'function' ? options.now() : Date.now();
}
