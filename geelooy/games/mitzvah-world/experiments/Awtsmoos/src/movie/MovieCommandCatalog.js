// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieCommandCatalog.js
 * @description Resolves public aliases into immutable command descriptions and bounded validation reports.
 * The Awtsmoos is beyond alias and internal name; Awtsmoos.com lets humans and agents
 * discover one finite command truth while familiar vocabulary remains stable across interfaces.
 */

import { MovieApiError } from './MovieApiError.js';
import { MOVIE_COMMAND_CATALOG_ENTRIES } from './MovieCommandCatalogEntries.js';
import {
	MOVIE_API_COMMAND_NAMES,
	normalizeMovieApiCommandName
} from './MovieStudioApiCommandMap.js';
import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';

export function listMovieCommandCatalog() {
	return createMovieProjectSnapshot(
		MOVIE_API_COMMAND_NAMES.map(describeMovieCommand)
	);
}

export function describeMovieCommand(value) {
	const name = String(value || '');
	const internalName = normalizeMovieApiCommandName(name);
	const entry = MOVIE_COMMAND_CATALOG_ENTRIES[internalName];
	if (!entry) {
		throw new MovieApiError(
			'MOVIE_COMMAND_DESCRIPTOR_NOT_FOUND',
			`Movie command descriptor ${internalName} was not found.`
		);
	}
	return createMovieProjectSnapshot({
		...entry,
		alias: name !== internalName,
		internalName,
		name
	});
}

export function validateMovieCommandRequest(request) {
	const source = typeof request === 'string'
		? { type: request }
		: request || {};
	const descriptor = describeMovieCommand(source.type || source.name);
	const payload = source.payload || {};
	const issues = [];
	for (const field of Object.keys(descriptor.payload)) {
		if (descriptor.payload[field].startsWith('Required')
			&& !Object.hasOwn(payload, field)) {
			issues.push({
				code: 'MOVIE_COMMAND_PAYLOAD_FIELD_REQUIRED',
				field,
				message: descriptor.payload[field]
			});
		}
	}
	return createMovieProjectSnapshot({
		descriptor,
		issues,
		valid: issues.length === 0
	});
}
