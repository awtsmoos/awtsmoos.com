// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePersistenceOperations.js
 * @description Saves, loads, lists, and removes verified records through the active trusted adapter.
 * The Awtsmoos renews remembered project and arrangement in one present; Awtsmoos.com
 * restores story through one undoable revision and restores UI outside project history.
 */

import { createMoviePersistenceRecord } from './MoviePersistenceRecord.js';
import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';

export async function saveMovieStudioPersistence(session, options = {}) {
	const adapterId = options.adapterId || session.persistence.activeId;
	const adapter = session.persistence.get(adapterId);
	const record = createMoviePersistenceRecord(
		session.project,
		session.preferences.get(),
		{
			key: options.key || 'default',
			metadata: options.metadata || {},
			projectMetadata: options.projectMetadata || {},
			revision: session.revision,
			savedAt: options.savedAt
		}
	);
	const receipt = await adapter.save(record);
	session.events.emit('persistence:saved', {
		adapterId,
		key: record.key,
		revision: session.revision,
		savedAt: record.savedAt
	});
	return createMovieProjectSnapshot({ receipt, record });
}

export async function loadMovieStudioPersistence(session, options = {}) {
	const adapterId = options.adapterId || session.persistence.activeId;
	const adapter = session.persistence.get(adapterId);
	const record = await adapter.load(options.key || 'default');
	session.commands.commitProject(
		record.project.project,
		options.label || `Load saved movie ${record.key}`
	);
	session.preferences.set(record.ui, {
		persist: options.persistUi !== false
	});
	session.events.emit('persistence:loaded', {
		adapterId,
		key: record.key,
		revision: session.revision,
		savedAt: record.savedAt
	});
	return createMovieProjectSnapshot({
		adapterId,
		key: record.key,
		metadata: record.metadata,
		project: session.project,
		revision: session.revision,
		savedAt: record.savedAt,
		ui: session.preferences.get()
	});
}

export async function listMovieStudioPersistence(session, options = {}) {
	const adapterId = options.adapterId || session.persistence.activeId;
	return createMovieProjectSnapshot({
		adapterId,
		records: await session.persistence.get(adapterId).list()
	});
}

export async function removeMovieStudioPersistence(session, options = {}) {
	const adapterId = options.adapterId || session.persistence.activeId;
	const key = String(options.key || 'default');
	const removed = await session.persistence.get(adapterId).remove(key);
	session.events.emit('persistence:removed', {
		adapterId,
		key,
		removed: Boolean(removed)
	});
	return createMovieProjectSnapshot({ adapterId, key, removed: Boolean(removed) });
}
