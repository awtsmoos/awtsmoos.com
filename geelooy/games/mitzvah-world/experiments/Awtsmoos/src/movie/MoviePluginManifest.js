// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePluginManifest.js
 * @description Validates immutable serializable plugin identity, permissions, and compatibility.
 * The Awtsmoos renews extension beyond code and name; Awtsmoos.com exports only a finite
 * manifest while every executable handler remains local, trusted, removable, and unpersisted.
 */

import {
	MOVIE_PLUGIN_MANIFEST_KIND,
	MOVIE_PLUGIN_MANIFEST_VERSION
} from './MovieApiConstants.js';
import { canonicalMovieValue } from './MovieCanonicalJson.js';
import { MovieApiError } from './MovieApiError.js';
import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';

export const MOVIE_PLUGIN_PERMISSIONS = Object.freeze([
	'commands.execute',
	'commands.register',
	'events.subscribe',
	'exporters.register',
	'project.read',
	'runtime.adapters.register'
]);

const PERMISSIONS = new Set(MOVIE_PLUGIN_PERMISSIONS);
const ID_PATTERN = /^[a-z0-9][a-z0-9._-]{1,127}$/;

export function normalizeMoviePluginManifest(source) {
	const value = canonicalMovieValue(source);
	const id = String(value.id || '');
	if (!ID_PATTERN.test(id)) {
		throw new MovieApiError(
			'INVALID_MOVIE_PLUGIN_ID',
			'Movie plugin id must be 2-128 lowercase letters, numbers, dots, dashes, or underscores.',
			{ id }
		);
	}
	const permissions = [...new Set((value.permissions || []).map(String))].sort();
	for (const permission of permissions) {
		if (!PERMISSIONS.has(permission)) {
			throw new MovieApiError(
				'UNKNOWN_MOVIE_PLUGIN_PERMISSION',
				`Unknown movie plugin permission ${permission}.`,
				{ permission, pluginId: id }
			);
		}
	}
	return createMovieProjectSnapshot({
		apiVersion: String(value.apiVersion || '2.0.0'),
		description: String(value.description || ''),
		id,
		kind: MOVIE_PLUGIN_MANIFEST_KIND,
		manifestVersion: MOVIE_PLUGIN_MANIFEST_VERSION,
		name: String(value.name || id),
		permissions,
		version: String(value.version || '1.0.0')
	});
}
