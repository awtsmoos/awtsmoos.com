// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieAgentCompiler.js
 * @description Parses literal or opt-in cinematic AI manifests into deterministic playable snapshots.
 * The Awtsmoos renews intention before grammar and runtime; Awtsmoos.com accepts one
 * JSON-only manifest, enriches only by decree, compiles its source, and returns no live objects.
 */

import {
	MOVIE_AGENT_MANIFEST_KIND,
	MOVIE_AGENT_MANIFEST_VERSION
} from './MovieApiConstants.js';
import { MovieApiError } from './MovieApiError.js';
import {
	canonicalMovieValue,
	parseCanonicalMovieJson
} from './MovieCanonicalJson.js';
import { enrichMovieAgentManifest } from './MovieAgentCinematicProfile.js';
import { compileMovieAgentScenes } from './MovieAgentSceneCompiler.js';
import { compileMovieProject } from './MovieProjectCompiler.js';
import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';

export function parseMovieAgentManifest(source) {
	const manifest = typeof source === 'string'
		? parseCanonicalMovieJson(source, 'movie agent manifest')
		: canonicalMovieValue(source);
	if (manifest?.kind !== MOVIE_AGENT_MANIFEST_KIND) {
		throw new MovieApiError(
			'AGENT_MANIFEST_KIND_MISMATCH',
			`Expected ${MOVIE_AGENT_MANIFEST_KIND}.`,
			{ actualKind: manifest?.kind || null }
		);
	}
	if (Number(manifest.manifestVersion) !== MOVIE_AGENT_MANIFEST_VERSION) {
		throw new MovieApiError(
			'UNSUPPORTED_AGENT_MANIFEST_VERSION',
			`Unsupported agent manifest version ${manifest.manifestVersion}.`
		);
	}
	return manifest;
}

export function compileMovieAgentManifest(source) {
	const manifest = enrichMovieAgentManifest(parseMovieAgentManifest(source));
	const sourceProject = manifest.project
		? canonicalMovieValue(manifest.project)
		: compileMovieAgentScenes(manifest);
	const compiled = compileMovieProject({
		...sourceProject,
		agentMetadata: manifest.metadata || sourceProject.agentMetadata || {}
	});
	const { sourceDocument, ...project } = compiled;
	return createMovieProjectSnapshot(project);
}
