// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioApiPersistence.js
 * @description Exposes adapter discovery, save/load/list/remove, trusted registration, and autosave.
 * The Awtsmoos renews memory beyond medium and delay; Awtsmoos.com lets agents save and
 * restore verified records while adapter functions remain local and autosave lifecycle stays explicit.
 */

import {
	listMovieStudioPersistence,
	loadMovieStudioPersistence,
	removeMovieStudioPersistence,
	saveMovieStudioPersistence
} from './MoviePersistenceOperations.js';
import {
	runMovieStudioApiAsyncOperation,
	runMovieStudioApiOperation
} from './MovieStudioApiOperation.js';

export function createMovieStudioPersistenceDomain(session) {
	return Object.freeze({
		adapters: () => session.persistence.state(),
		autosave: Object.freeze({
			flush: options => runMovieStudioApiAsyncOperation(
				session,
				'persistence.autosave.flush',
				options,
				() => session.autosave.flush()
			),
			start: (value, options = {}) => runMovieStudioApiOperation(
				session,
				'persistence.autosave.start',
				options,
				() => session.autosave.start(value)
			),
			state: () => session.autosave.state(),
			stop: options => runMovieStudioApiOperation(
				session,
				'persistence.autosave.stop',
				options,
				() => session.autosave.stop()
			)
		}),
		list: (options = {}) => runMovieStudioApiAsyncOperation(
			session,
			'persistence.list',
			options,
			() => listMovieStudioPersistence(session, options)
		),
		load: (key, options = {}) => runMovieStudioApiAsyncOperation(
			session,
			'persistence.load',
			options,
			() => loadMovieStudioPersistence(session, { ...options, key })
		),
		registerTrusted: (manifest, adapter) => session.persistence.register(
			manifest,
			adapter
		),
		remove: (key, options = {}) => runMovieStudioApiAsyncOperation(
			session,
			'persistence.remove',
			options,
			() => removeMovieStudioPersistence(session, { ...options, key })
		),
		save: (key, options = {}) => runMovieStudioApiAsyncOperation(
			session,
			'persistence.save',
			options,
			() => saveMovieStudioPersistence(session, { ...options, key })
		),
		select: (adapterId, options = {}) => runMovieStudioApiOperation(
			session,
			'persistence.select',
			options,
			() => session.persistence.select(adapterId)
		),
		unregisterTrusted: adapterId => session.persistence.unregister(adapterId)
	});
}
