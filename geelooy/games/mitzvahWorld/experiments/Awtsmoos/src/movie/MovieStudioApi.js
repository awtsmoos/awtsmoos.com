// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioApi.js
 * @description Creates one stable facade over project, procedural agents, media, text, 3D, jobs, instances, and UI.
 * The Awtsmoos renews every project and service while identity remains beyond replacement;
 * Awtsmoos.com gives old callers familiar doors and agents immutable machine contracts for the complete studio.
 */

import {
	MOVIE_AGENT_MANIFEST_VERSION,
	MOVIE_API_CAPABILITIES,
	MOVIE_API_VERSION,
	MOVIE_PROJECT_SCHEMA_VERSION
} from './MovieApiConstants.js';
import { createMovieStudioAgentDomain } from './MovieStudioApiAgent.js';
import { createMovieStudioAuthoring3dDomain } from './MovieStudioApiAuthoring3d.js';
import {
	addMovieStudioCompatibilityApi,
	createUnsafeMovieStudioApi
} from './MovieStudioApiCompatibility.js';
import { createMovieStudioCommandsDomain } from './MovieStudioApiCommands.js';
import { createMovieStudioDiagnosticsDomain } from './MovieStudioApiDiagnostics.js';
import { createMovieStudioEventsDomain } from './MovieStudioApiEvents.js';
import { createMovieStudioHistoryDomain } from './MovieStudioApiHistory.js';
import { createMovieStudioInstancesDomain } from './MovieStudioApiInstances.js';
import { createMovieStudioMediaDomain } from './MovieStudioApiMedia.js';
import { createMovieStudioPatchDomain } from './MovieStudioApiPatch.js';
import { createMovieStudioPersistenceDomain } from './MovieStudioApiPersistence.js';
import { createMovieStudioPlaybackDomain } from './MovieStudioApiPlayback.js';
import { createMovieStudioPluginsDomain } from './MovieStudioApiPlugins.js';
import { createMovieStudioProjectDomain } from './MovieStudioApiProject.js';
import { createMovieStudioRenderJobsDomain } from './MovieStudioApiRenderJobs.js';
import { createMovieStudioRuntimeAdaptersDomain } from './MovieStudioApiRuntimeAdapters.js';
import { createMovieStudioSchemaDomain } from './MovieStudioApiSchema.js';
import { createMovieStudioSelectionDomain } from './MovieStudioApiSelection.js';
import { createMovieStudioTextDomain } from './MovieStudioApiText.js';
import { createMovieStudioTimelineDomain } from './MovieStudioApiTimeline.js';
import { createMovieStudioUiDomain } from './MovieStudioApiUi.js';
import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';

export function createMovieStudioApi(session) {
	const commands = createMovieStudioCommandsDomain(session);
	const api = {
		agent: createMovieStudioAgentDomain(session),
		agentManifestVersion: MOVIE_AGENT_MANIFEST_VERSION,
		apiVersion: MOVIE_API_VERSION,
		authoring3d: createMovieStudioAuthoring3dDomain(session),
		capabilities: createMovieProjectSnapshot(MOVIE_API_CAPABILITIES),
		commands,
		diagnostics: createMovieStudioDiagnosticsDomain(session),
		events: createMovieStudioEventsDomain(session),
		history: createMovieStudioHistoryDomain(session, commands),
		instances: createMovieStudioInstancesDomain(session),
		media: createMovieStudioMediaDomain(session, commands),
		patch: createMovieStudioPatchDomain(session),
		persistence: createMovieStudioPersistenceDomain(session),
		playback: createMovieStudioPlaybackDomain(session),
		plugins: createMovieStudioPluginsDomain(session),
		project: createMovieStudioProjectDomain(session),
		projectSchemaVersion: MOVIE_PROJECT_SCHEMA_VERSION,
		renderJobs: createMovieStudioRenderJobsDomain(session),
		runtimeAdapters: createMovieStudioRuntimeAdaptersDomain(session),
		schema: createMovieStudioSchemaDomain(session),
		selection: createMovieStudioSelectionDomain(session),
		text: createMovieStudioTextDomain(session, commands),
		timeline: createMovieStudioTimelineDomain(session, commands),
		transactions: Object.freeze({
			execute: (batch, options) => commands.executeBatch(batch, options)
		}),
		ui: createMovieStudioUiDomain(session),
		unsafe: createUnsafeMovieStudioApi(session)
	};
	addMovieStudioCompatibilityApi(api, session);
	return Object.freeze(api);
}

export const MovieStudioApi = createMovieStudioApi;

export function publishMovieStudioApi(session) {
	if (session.instanceRegistry) return session.instanceRegistry.publish(session);
	globalThis.AwtsmoosMovie = session.publicApi;
	return session.publicApi;
}
