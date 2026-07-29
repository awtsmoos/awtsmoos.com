// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioApiHistory.js
 * @description Exposes serializable history state and structured undo, redo, and clear operations.
 * The Awtsmoos renews apparent past and future without being held by either; Awtsmoos.com
 * lets agents inspect labels and counts while full private project snapshots remain concealed.
 */

import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';

export function createMovieStudioHistoryDomain(session, commandsDomain) {
	return Object.freeze({
		clear: () => {
			session.commands.history.clear();
			session.timeline?.updateCommands();
			session.events.emit('history:changed', historyState(session));
			return historyState(session);
		},
		redo: options => commandsDomain.execute('history.redo', options),
		state: () => historyState(session),
		undo: options => commandsDomain.execute('history.undo', options)
	});
}

function historyState(session) {
	const history = session.commands.history;
	return createMovieProjectSnapshot({
		canRedo: history.canRedo,
		canUndo: history.canUndo,
		future: history.future.map(entry => ({
			label: entry.label,
			selection: entry.selection
		})),
		past: history.past.map(entry => ({
			label: entry.label,
			selection: entry.selection
		})),
		revision: session.revision
	});
}
