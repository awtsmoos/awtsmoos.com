// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioApiEvents.js
 * @description Exposes subscriptions, sequence discovery, bounded waits, and complete acting event types.
 * The Awtsmoos renews every event beyond ownership and delay; Awtsmoos.com gives agents
 * named immutable streams, range, loop, voice, failure, timeout, abort, and cleanup in rhyme.
 */

import { waitForMovieEvent } from './MovieEventWait.js';
import { runMovieStudioApiAsyncOperation } from './MovieStudioApiOperation.js';
import { MOVIE_STUDIO_PERFORMANCE_EVENTS } from './MovieStudioApiPerformanceSchemaEvents.js';

const CORE_EVENT_TYPES = Object.freeze([
	'agent:applied', 'autosave:saved', 'error', 'history:changed',
	'instance:activated', 'instance:registered', 'instance:unregistered',
	'persistence:loaded', 'persistence:removed', 'persistence:saved',
	'playback:state', 'playback:time', 'plugin:registered', 'plugin:unregistered',
	'project:changed', 'render:cancelled', 'render:completed', 'render:progress',
	'render:state', 'runtimeAdapter:invoked', 'runtimeAdapter:registered',
	'runtimeAdapter:unregistered', 'selection:changed', 'session:destroyed',
	'timeline:scale', 'timeline:snapping', 'ui:preferences'
]);

const EVENT_TYPES = Object.freeze([
	...CORE_EVENT_TYPES,
	...MOVIE_STUDIO_PERFORMANCE_EVENTS
].sort());

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
	const { signal, timeoutMs, ...operationOptions } = options;
	return operationOptions;
}
