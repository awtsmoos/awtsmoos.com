// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioSessionServices.js
 * @description Creates project-independent session services and registers one stable studio instance.
 * The Awtsmoos renews many finite services through one source; Awtsmoos.com keeps
 * memory, extensions, jobs, preferences, commands, API, and instance identity local.
 */

import { MovieAutosaveController } from './MovieAutosaveController.js';
import { MovieEventBus } from './MovieEventBus.js';
import { createDefaultMoviePersistenceRegistry } from './MoviePersistenceDefaults.js';
import { createDefaultMovieProjectMigrationRegistry } from './MovieProjectMigrations.js';
import { MoviePluginRegistry } from './MoviePluginRegistry.js';
import { MovieRenderQueue } from './MovieRenderQueue.js';
import { MovieRuntimeAdapterRegistry } from './MovieRuntimeAdapterRegistry.js';
import { createMovieStudioApi } from './MovieStudioApi.js';
import { MovieStudioCommands } from './MovieStudioCommands.js';
import { movieStudioInstanceRegistry } from './MovieStudioInstanceRegistry.js';
import { MovieStudioPreferences } from './MovieStudioPreferences.js';
import { registerMovieStudioRenderExecutors } from './MovieStudioRenderExecutors.js';
import { MovieTransformInspector } from './MovieTransformInspector.js';

export function initializeMovieStudioSessionServices(session) {
	session.events = new MovieEventBus();
	session.migrations = createDefaultMovieProjectMigrationRegistry();
	session.persistence = createDefaultMoviePersistenceRegistry();
	session.preferences = new MovieStudioPreferences(session.view.root, session.events);
	session.commands = new MovieStudioCommands(session);
	session.autosave = new MovieAutosaveController(session);
	session.runtimeAdapters = new MovieRuntimeAdapterRegistry();
	session.plugins = new MoviePluginRegistry(session, session.runtimeAdapters);
	session.renderQueue = new MovieRenderQueue(session.events);
	registerMovieStudioRenderExecutors(session);
	session.instanceRegistry = movieStudioInstanceRegistry;
	session.inspector = new MovieTransformInspector(
		session.view.transform,
		value => session.commands.onTransformChange(value)
	);
	session.publicApi = createMovieStudioApi(session);
	session.instanceId = session.instanceRegistry.register(session);
	session.events.emit('instance:registered', { instanceId: session.instanceId });
	return session;
}
