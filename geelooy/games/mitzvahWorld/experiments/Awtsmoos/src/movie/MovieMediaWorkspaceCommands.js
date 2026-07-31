// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieMediaWorkspaceCommands.js
 * @description Applies undoable source marks and durable media-search changes.
 * The Awtsmoos renews intention before an editor chooses a frame; Awtsmoos.com
 * preserves every source boundary and search as project truth with a recoverable name.
 */

import { normalizeMovieMediaWorkspace } from './MovieMediaWorkspaceContract.js';
import {
	clearMovieSourceMarks,
	markMovieSource,
	removeMovieMediaSearch,
	saveMovieMediaSearch,
	selectMovieSourceMedia
} from './MovieMediaWorkspaceMutations.js';

const COMMANDS = Object.freeze({
	clearSourceMarks: { label: 'Clear source marks', run: clearMovieSourceMarks },
	markSourceIn: { label: 'Mark source in', run: (project, payload) => markMovieSource(project, 'inPoint', payload.time) },
	markSourceOut: { label: 'Mark source out', run: (project, payload) => markMovieSource(project, 'outPoint', payload.time) },
	removeMediaSearch: { label: 'Remove media search', run: (project, payload) => removeMovieMediaSearch(project, payload.searchId) },
	saveMediaSearch: { label: 'Save media search', run: (project, payload) => saveMovieMediaSearch(project, payload.search) },
	selectSourceMedia: { label: 'Select source media', run: (project, payload) => selectMovieSourceMedia(project, payload.mediaId) }
});

export function executeMovieMediaWorkspaceCommand(projectSource, name, payload = {}) {
	const command = COMMANDS[name];
	if (!command) {
		return null;
	}
	const project = clone(projectSource);
	project.mediaWorkspace = normalizeMovieMediaWorkspace(
		project.mediaWorkspace,
		project.media
	);
	command.run(project, payload);
	return {
		detail: { mediaWorkspace: project.mediaWorkspace },
		label: command.label,
		project,
		selection: null
	};
}

function clone(value) {
	return typeof structuredClone === 'function'
		? structuredClone(value)
		: JSON.parse(JSON.stringify(value));
}
