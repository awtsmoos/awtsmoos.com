// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieCommandCatalog.test.mjs
 * @description Proves complete command discovery, alias resolution, payload validation, and JSON safety.
 * The Awtsmoos renews action beyond every public name; Awtsmoos.com verifies
 * humans, mobile controls, palettes, and agents can discover one immutable command truth.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	describeMovieCommand,
	listMovieCommandCatalog,
	validateMovieCommandRequest
} from '../../movie/MovieCommandCatalog.js';
import { MOVIE_API_COMMAND_NAMES } from '../../movie/MovieStudioApiCommandMap.js';

test('catalog describes every callable public command name immutably', () => {
	const catalog = listMovieCommandCatalog();
	assert.equal(catalog.length, MOVIE_API_COMMAND_NAMES.length);
	assert.deepEqual(catalog.map(item => item.name), MOVIE_API_COMMAND_NAMES);
	assert.equal(Object.isFrozen(catalog), true);
	assert.doesNotThrow(() => JSON.stringify(catalog));
	assert.equal(JSON.stringify(catalog).includes('function'), false);
});

test('aliases resolve to one internal command descriptor', () => {
	const alias = describeMovieCommand('marker.add');
	const internal = describeMovieCommand('addMarker');
	assert.equal(alias.internalName, 'addMarker');
	assert.equal(alias.alias, true);
	assert.equal(internal.internalName, 'addMarker');
	assert.equal(internal.alias, false);
	assert.equal(alias.title, internal.title);
	assert.equal(alias.undoable, true);
});

test('descriptors expose selection, mutation, batch, category, and shortcut metadata', () => {
	const split = describeMovieCommand('clip.split');
	assert.equal(split.requiresSelection, true);
	assert.equal(split.mutatesProject, true);
	assert.equal(split.batchable, true);
	assert.equal(split.undoable, true);
	assert.equal(split.category, 'Clips');
	assert.equal(split.shortcut, null);
	const undo = describeMovieCommand('history.undo');
	assert.equal(undo.shortcut, 'Mod+Z');
	assert.equal(undo.batchable, false);
});

test('validation reports required payload fields without mutating or executing', () => {
	const invalid = validateMovieCommandRequest({
		payload: {},
		type: 'marker.remove'
	});
	assert.equal(invalid.valid, false);
	assert.deepEqual(invalid.issues.map(issue => issue.field), ['markerId']);
	assert.equal(
		invalid.issues[0].code,
		'MOVIE_COMMAND_PAYLOAD_FIELD_REQUIRED'
	);
	const valid = validateMovieCommandRequest({
		payload: { markerId: 'marker-one' },
		type: 'marker.remove'
	});
	assert.equal(valid.valid, true);
	assert.deepEqual(valid.issues, []);
});

test('unknown commands retain the established coded failure', () => {
	assert.throws(
		() => describeMovieCommand('project.explode'),
		error => error.code === 'UNKNOWN_MOVIE_COMMAND'
	);
});
