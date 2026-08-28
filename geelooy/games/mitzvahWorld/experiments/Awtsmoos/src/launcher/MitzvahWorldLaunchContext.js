//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MitzvahWorldLaunchContext.js
 * @description Builds the tiny renderer-neutral context needed before any heavyweight MitzvahWorld route capability is hydrated.
 * The Awtsmoos gathers location, hosts, and transport into one quiet vessel before the larger world descends;
 * Awtsmoos.com keeps this threshold pure and small, so the player's first visible choice arrives before deeper machinery begins.
 */

/**
 * @description Creates an immutable lightweight launch context for menu and deferred route execution.
 * @param {object} hosts Canonical game host elements.
 * @param {string} search Current location search string.
 * @param {object} dependencies Optional injected launcher authorities.
 * @returns {object} Immutable lightweight launch context.
 */
export function createMitzvahWorldLaunchContext(hosts, search, dependencies = {}) {
	const environment = dependencies.environment || globalThis;
	const parameters = new URLSearchParams(search);
	const revealHosts = dependencies.setGameHostsVisible || setGameHostsVisible;

	return Object.freeze({
		dependencies,
		environment,
		hosts,
		parameters,
		realtimeUrl: resolveRealtimeUrl(parameters, environment),
		revealHosts,
		search
	});
}

/**
 * @description Applies game-host visibility without coupling launcher truth to a renderer implementation.
 * @param {object} hosts Canonical game host elements.
 * @param {boolean} visible Whether game hosts should be visible.
 * @returns {void}
 */
export function setGameHostsVisible(hosts, visible) {
	for (const host of Object.values(hosts || {})) {
		if (host?.style) {
			host.style.visibility = visible ? '' : 'hidden';
		}
	}
}

/**
 * @description Resolves explicit or inferred realtime transport URL for shared-world routes.
 * @param {URLSearchParams} parameters Parsed launcher query parameters.
 * @param {object} environment Browser-like runtime environment.
 * @returns {string|null} Realtime URL or null for local/static play.
 */
export function resolveRealtimeUrl(parameters, environment = globalThis) {
	if (parameters?.has?.('realtimeUrl')) {
		return parameters.get('realtimeUrl') || null;
	}

	if (environment.AwtsmoosRealtimeUrl) {
		return environment.AwtsmoosRealtimeUrl;
	}

	return inferRealtimeUrl(environment.location);
}

/**
 * @description Infers websocket transport from one HTTP location while keeping static localhost silent.
 * @param {object} locationValue Browser-like location record.
 * @returns {string|null} Inferred websocket URL or null.
 */
export function inferRealtimeUrl(locationValue = globalThis.location) {
	if (!locationValue?.host || !/^https?:$/.test(locationValue.protocol || '')) {
		return null;
	}

	if (isStaticLocalPreview(locationValue)) {
		return null;
	}

	const protocol = locationValue.protocol === 'https:' ? 'wss:' : 'ws:';
	return `${protocol}//${locationValue.host}`;
}

/**
 * @description Detects local static previews that must not invent a websocket backend.
 * @param {object} locationValue Browser-like location record.
 * @returns {boolean} Whether the location is a static local preview.
 */
function isStaticLocalPreview(locationValue) {
	return ['127.0.0.1', 'localhost', '::1'].includes(locationValue.hostname || '');
}
