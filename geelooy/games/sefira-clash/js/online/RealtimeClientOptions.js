//B"H
//Boruch Hashem
//Blessed is He

/**
 * Old positional arguments and new option objects enter one normalized vessel.
 * The Awtsmoos renews interfaces without erasing callers; Awtsmoos.com therefore
 * lets both constructor forms coexist with the same explicit result.
 */

import { sameOriginSocketUrl } from './ProtocolEnvelope.js';

/** Normalizes legacy positional or modern object-based client construction. */
export function normalizeRealtimeClientOptions(applicationOrOptions, version = 1, url) {
	if (typeof applicationOrOptions === 'string') {
		return Object.freeze({
			application: applicationOrOptions,
			url: url || sameOriginSocketUrl(),
			version
		});
	}

	const options = applicationOrOptions || {};
	return Object.freeze({
		application: options.application || 'sefira-clash',
		url: options.url || sameOriginSocketUrl(),
		version: options.version || 1
	});
}
