// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioApiEvents.js
 * @description Exposes subscriptions, monotonic sequence discovery, and bounded structured event waiting.
 * The Awtsmoos renews every event beyond ownership and delay; Awtsmoos.com gives agents
 * named finite streams, immutable detail, timeout, abort, and cleanup while emission authority stays local.
 */

import { waitForMovieEvent } from './MovieEventWait.js';
import { runMovieStudioApiAsyncOperation } from './MovieStudioApiOperation.js';

const EVENT_TYPES = Object.freeze([
	'agent:applied',
	'autosave:saved',
	'error',
	'history:changed',
	'instance:activated',
	'instance:registered',
	'instance:unregistered',
	'persistence:loaded',
	'persistence:removed',
	'persistence:saved',
	'playback:state',
	'playback:time',
	'plugin:registered',
	'plugin:unregistered',
	'project:changed',
	'render:cancelled',
	'render:completed',
	'render:progress',
	'render:state',
	'runtimeAdapter:invoked',
	'runtimeAdapter:registered',
	'runtimeAdapter:unregistered',
	'selection:changed',
	'session:destroyed',
	'timeline:scale',
	'timeline:snapping',
	'ui:preferences'
]);

export function createMovieStudioEventsDomain(session) {
	return Object.freeze({
		off: (type, listener) => session.events.off(type, listener),
		on: (type, listener) => session.events.on(type, listener),
		once: (type, listener) => session.events.once(type, listener),
		sequence: () => session.events.sequence,
		types: () => [...EVENT_TYPES],
		waitFor: (query, options = {}) => runMovieStudioApiAsyncOperation(
			session,
			'events.waitFor',
			movieEventOperationOptions(options),
			() => waitForMovieEvent(
				session,
				movieEventWaitSource(query, options),
				{ signal: options.signal }
			)
		)
	});
}

function movieEventWaitSource(query, options) {
	const source = typeof query === 'string'
		? { type: query }
		: { ...(query || {}) };
	if (source.timeoutMs == null && options.timeoutMs != null) {
		source.timeoutMs = options.timeoutMs;
	}
	return source;
}

function movieEventOperationOptions(options) {
	const {
		signal,
		timeoutMs,
		...operationOptions
	} = options;
	return operationOptions;
}
