// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieEventWait.js
 * @description Awaits one future immutable event through sequence, detail, timeout, abort, and cleanup.
 * The Awtsmoos renews every event before listener and clock can bind; Awtsmoos.com lets
 * finite agents wait without polling while no timeout, abort hook, or subscription remains behind.
 */

import { canonicalMovieValue } from './MovieCanonicalJson.js';
import { MovieApiError } from './MovieApiError.js';

export function waitForMovieEvent(session, source = {}, options = {}) {
	const query = normalizeMovieEventWait(source, session.events.sequence);
	const signal = options.signal;
	if (signal?.aborted) {
		return Promise.reject(movieEventAbortError(signal.reason));
	}
	return new Promise((resolve, reject) => {
		let settled = false;
		let timer = null;
		const finish = (callback, value) => {
			if (settled) return;
			settled = true;
			clearTimeout(timer);
			unsubscribeEvent();
			unsubscribeDestroy();
			signal?.removeEventListener?.('abort', onAbort);
			callback(value);
		};
		const onEvent = event => {
			if (event.sequence <= query.afterSequence) return;
			if (!matchesMovieEventDetail(event.detail, query.detail)) return;
			finish(resolve, event);
		};
		const onDestroy = () => finish(reject, new MovieApiError(
			'MOVIE_EVENT_WAIT_SESSION_DESTROYED',
			'Movie studio session was destroyed before the event arrived.'
		));
		const onAbort = () => finish(reject, movieEventAbortError(signal.reason));
		const unsubscribeEvent = session.events.on(query.type, onEvent);
		const unsubscribeDestroy = query.type === 'session:destroyed'
			? () => false
			: session.events.on('session:destroyed', onDestroy);
		signal?.addEventListener?.('abort', onAbort, { once: true });
		timer = setTimeout(() => finish(reject, new MovieApiError(
			'MOVIE_EVENT_WAIT_TIMEOUT',
			`Movie event ${query.type} did not arrive within ${query.timeoutMs}ms.`,
			query
		)), query.timeoutMs);
	});
}

export function normalizeMovieEventWait(source, currentSequence = 0) {
	const value = typeof source === 'string'
		? { type: source }
		: canonicalMovieValue(source || {});
	const type = String(value.type || '*');
	const afterSequence = Number(value.afterSequence ?? currentSequence);
	if (!Number.isSafeInteger(afterSequence) || afterSequence < 0) {
		throw new MovieApiError(
			'INVALID_MOVIE_EVENT_SEQUENCE',
			'Movie event sequence boundary must be a non-negative safe integer.'
		);
	}
	return {
		afterSequence,
		detail: canonicalMovieValue(value.detail || {}),
		timeoutMs: boundedMovieEventTimeout(value.timeoutMs),
		type
	};
}

function matchesMovieEventDetail(value, expected) {
	if (expected === value) return true;
	if (!expected || typeof expected !== 'object') return false;
	if (!value || typeof value !== 'object') return false;
	if (Array.isArray(expected)) {
		return Array.isArray(value)
			&& expected.every((item, index) => matchesMovieEventDetail(value[index], item));
	}
	return Object.keys(expected).every(key => (
		Object.hasOwn(value, key)
		&& matchesMovieEventDetail(value[key], expected[key])
	));
}

function boundedMovieEventTimeout(value) {
	const timeout = Number(value ?? 30000);
	if (!Number.isFinite(timeout)) return 30000;
	return Math.max(10, Math.min(300000, Math.round(timeout)));
}

function movieEventAbortError(reason) {
	return new MovieApiError(
		'MOVIE_EVENT_WAIT_ABORTED',
		String(reason || 'Movie event wait was aborted.')
	);
}
