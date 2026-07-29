// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioApiCompatibility.js
 * @description Adds familiar root methods and an explicit unsafe live-object escape hatch.
 * The Awtsmoos renews every project while callers remember former doors; Awtsmoos.com
 * preserves those doors while immutable root JSON reveals command, event, selection, and service state.
 */

import { MOVIE_API_CAPABILITIES, MOVIE_API_VERSION } from './MovieApiConstants.js';
import { renderExactMovieStudioSession } from './MovieExactRender.js';
import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';
import {
	copyMovieStudioUrl,
	renderMovieStudioSession
} from './MovieStudioSessionActions.js';

export function addMovieStudioCompatibilityApi(api, session) {
	Object.assign(api, {
		addMarker: () => session.commands.run('addMarker'),
		applyJson: text => api.project.replace(JSON.parse(text), {
			label: 'Apply project JSON'
		}),
		commandState: () => session.commands.state(),
		copyUrl: () => copyMovieStudioUrl(session),
		deleteSelected: () => session.commands.run('delete'),
		destroy: () => session.destroy(),
		duplicateSelected: () => session.commands.run('duplicate'),
		play: () => session.play(),
		redo: () => session.commands.run('redo'),
		render: () => renderMovieStudioSession(session),
		renderExact: options => renderExactMovieStudioSession(session, options),
		seek: time => session.seek(time),
		splitSelected: () => session.commands.run('split'),
		toJSON: () => createMovieStudioApiSnapshot(session),
		toggleSnapping: () => session.commands.run('toggleSnap'),
		undo: () => session.commands.run('undo')
	});
	Object.defineProperties(api, {
		director: { enumerable: false, get: () => session.director },
		ready: { enumerable: true, get: () => !session.destroyed },
		recorder: { enumerable: false, get: () => session.recorder },
		revision: { enumerable: true, get: () => session.revision },
		runtime: { enumerable: false, get: () => session.runtime },
		view: { enumerable: false, get: () => session.view }
	});
}

export function createUnsafeMovieStudioApi(session) {
	const unsafe = {};
	Object.defineProperties(unsafe, {
		diagnostics: { enumerable: true, get: () => session.diagnostics },
		director: { enumerable: true, get: () => session.director },
		recorder: { enumerable: true, get: () => session.recorder },
		runtime: { enumerable: true, get: () => session.runtime },
		view: { enumerable: true, get: () => session.view }
	});
	return Object.freeze(unsafe);
}

function createMovieStudioApiSnapshot(session) {
	return createMovieProjectSnapshot({
		apiVersion: MOVIE_API_VERSION,
		capabilities: MOVIE_API_CAPABILITIES,
		commandState: session.commands.state(),
		eventSequence: session.events.sequence,
		instances: session.instanceRegistry?.state?.() || {
			activeId: null,
			instances: []
		},
		persistence: {
			adapters: session.persistence.state(),
			autosave: session.autosave.state()
		},
		plugins: session.plugins.list(),
		project: session.project,
		renderJobs: session.renderQueue.list(),
		revision: session.revision,
		runtimeAdapters: session.runtimeAdapters.state(),
		selection: session.commands.selection,
		selectionCount: session.commands.selectionSet.items.length,
		selectionSet: session.commands.selectionSet,
		ui: session.preferences.get()
	});
}
