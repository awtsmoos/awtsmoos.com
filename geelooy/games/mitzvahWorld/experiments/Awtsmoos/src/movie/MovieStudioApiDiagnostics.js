// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioApiDiagnostics.js
 * @description Exposes immutable project, history, renderer, runtime, API, and selection diagnostics.
 * The Awtsmoos renews every measured vessel beyond measurement; Awtsmoos.com gives agents
 * enough finite evidence to plan safely without exposing renderer, DOM, or mutable runtime objects.
 */

import { MOVIE_API_CAPABILITIES } from './MovieApiConstants.js';
import { canonicalMovieValue } from './MovieCanonicalJson.js';
import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';

export function createMovieStudioDiagnosticsDomain(session) {
	return Object.freeze({
		snapshot: () => diagnosticsSnapshot(session),
		validateCurrentProject: () => session.publicApi.project.validate(session.project)
	});
}

function diagnosticsSnapshot(session) {
	const tracks = session.project?.tracks || [];
	return createMovieProjectSnapshot({
		apiCapabilities: MOVIE_API_CAPABILITIES,
		commandState: session.commands.state(),
		counts: {
			clips: tracks.reduce((sum, track) => sum + track.clips.length, 0),
			markers: session.project?.markers?.length || 0,
			tracks: tracks.length
		},
		eventSequence: session.events.sequence,
		history: {
			future: session.commands.history.future.length,
			past: session.commands.history.past.length
		},
		playback: {
			duration: session.project?.duration || 0,
			playing: Boolean(session.director?.playing),
			time: session.time
		},
		renderer: safeRendererStats(session.runtime?.renderer?.stats),
		revision: session.revision,
		runtimeCapabilities: {
			doors: Array.isArray(session.runtime?.doors),
			npc: Boolean(session.runtime?.npc),
			shadows: Boolean(session.runtime?.shadows?.update),
			webglCanvas: Boolean(session.runtime?.renderer?.canvas)
		},
		selection: session.commands.selection,
		selectionCount: session.commands.selectionSet.items.length,
		selectionSet: session.commands.selectionSet,
		title: session.project?.title || ''
	});
}

function safeRendererStats(value) {
	try {
		return canonicalMovieValue(value || {});
	} catch {
		return {};
	}
}
