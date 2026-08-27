// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieStudioApiHarness.mjs
 * @description Creates a detached real command, memory, extension, render, event, and stable API session.
 * The Awtsmoos renews browser and test vessel alike; Awtsmoos.com removes WebGL and DOM
 * while preserving canonical project, UI, persistence, plugins, adapters, jobs, history, and commands.
 */

import { MovieAutosaveController } from '../../movie/MovieAutosaveController.js';
import { createDefaultMoviePersistenceRegistry } from '../../movie/MoviePersistenceDefaults.js';
import { createDefaultMovieProjectMigrationRegistry } from '../../movie/MovieProjectMigrations.js';
import { MoviePluginRegistry } from '../../movie/MoviePluginRegistry.js';
import { MovieRenderQueue } from '../../movie/MovieRenderQueue.js';
import { MovieRuntimeAdapterRegistry } from '../../movie/MovieRuntimeAdapterRegistry.js';
import { createMovieStudioApi } from '../../movie/MovieStudioApi.js';
import { MovieStudioCommands } from '../../movie/MovieStudioCommands.js';
import { createMovieStudioPreferenceHarness } from './movieStudioPreferenceHarness.mjs';
import { createMovieStudioHarnessSession } from './movieStudioApiHarnessSession.mjs';

export function createMovieStudioApiHarness() {
	const session = createMovieStudioHarnessSession(sampleMovieProject());
	const preferenceHarness = createMovieStudioPreferenceHarness({
		events: session.events
	});
	session.preferences = preferenceHarness.preferences;
	session.preferenceHarness = preferenceHarness;
	session.migrations = createDefaultMovieProjectMigrationRegistry();
	session.persistence = createDefaultMoviePersistenceRegistry();
	session.commands = new MovieStudioCommands(session);
	session.autosave = new MovieAutosaveController(session);
	session.runtimeAdapters = new MovieRuntimeAdapterRegistry();
	session.plugins = new MoviePluginRegistry(session, session.runtimeAdapters);
	session.renderQueue = new MovieRenderQueue(session.events);
	session.publicApi = createMovieStudioApi(session);
	return { api: session.publicApi, preferenceHarness, session };
}

export function sampleMovieProject() {
	return {
		duration: 12,
		fps: 24,
		markers: [],
		resolution: { height: 540, width: 960 },
		title: 'API Harness Movie',
		tracks: [{
			clips: [{ duration: 4, id: 'clip', start: 2 }],
			id: 'actors',
			target: 'player',
			type: 'actor'
		}],
		version: 1
	};
}

export function selectHarnessClip(session) {
	const track = session.project.tracks[0];
	const clip = track.clips[0];
	session.commands.select({
		clip,
		descriptor: { clipId: clip.id, trackId: track.id },
		track
	});
}
