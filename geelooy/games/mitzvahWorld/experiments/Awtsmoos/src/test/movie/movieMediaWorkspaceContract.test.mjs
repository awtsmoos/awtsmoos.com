// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieMediaWorkspaceContract.test.mjs
 * @description Proves canonical marks, folders, metadata search, saved searches, and failure bounds.
 * The Awtsmoos knows every asset before a finite query begins; Awtsmoos.com verifies
 * source and bin truth remain deterministic, JSON-safe, bounded, and independent of UI state.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { executeMovieMediaWorkspaceCommand } from '../../movie/MovieMediaWorkspaceCommands.js';
import { listMovieMediaFolders, searchMovieMedia } from '../../movie/MovieMediaSearch.js';
import { normalizeMovieMediaWorkspace } from '../../movie/MovieMediaWorkspaceContract.js';
import { createMovieEditorialProject } from './movieEditorialFixture.mjs';

test('workspace normalizes selected source and bounded marks', () => {
	const project = createMovieEditorialProject();
	const workspace = normalizeMovieMediaWorkspace(project.mediaWorkspace, project.media);
	assert.deepEqual(workspace.source, { inPoint: 2, mediaId: 'video-a', outPoint: 5 });
	project.mediaWorkspace.source.inPoint = 99;
	project.mediaWorkspace.source.outPoint = -1;
	assert.deepEqual(
		normalizeMovieMediaWorkspace(project.mediaWorkspace, project.media).source,
		{ inPoint: 10, mediaId: 'video-a', outPoint: 10 }
	);
});

test('search covers folders, tags, metadata, kind, and timeline usage', () => {
	const project = createMovieEditorialProject();
	assert.deepEqual(listMovieMediaFolders(project), [
		'', 'Audio', 'Audio/Ambience', 'Interviews', 'Interviews/Day 1', 'Stills'
	]);
	assert.deepEqual(searchMovieMedia(project, 'dialogue').map(item => item.id), ['video-a']);
	assert.deepEqual(searchMovieMedia(project, 'day 1').map(item => item.id), ['video-a']);
	assert.deepEqual(
		searchMovieMedia(project, '', { folder: 'Audio', recursive: true }).map(item => item.id),
		['audio-a']
	);
	assert.deepEqual(searchMovieMedia(project, '', { used: true }).map(item => item.id), ['video-a']);
	assert.deepEqual(
		searchMovieMedia(project, '', { kind: 'image', used: false }).map(item => item.id),
		['image-a']
	);
});

test('workspace commands are immutable and reject invalid marks', () => {
	const project = createMovieEditorialProject();
	const selected = executeMovieMediaWorkspaceCommand(project, 'selectSourceMedia', {
		mediaId: 'audio-a'
	});
	assert.equal(selected.project.mediaWorkspace.source.mediaId, 'audio-a');
	assert.equal(project.mediaWorkspace.source.mediaId, 'video-a');
	assert.throws(
		() => executeMovieMediaWorkspaceCommand(project, 'markSourceIn', { time: Infinity }),
		/finite number/
	);
	assert.throws(
		() => executeMovieMediaWorkspaceCommand(project, 'markSourceOut', { time: 1 }),
		/cannot precede/
	);
});

test('saved searches replace by identity and remain JSON-safe', () => {
	const project = createMovieEditorialProject();
	const first = executeMovieMediaWorkspaceCommand(project, 'saveMediaSearch', {
		search: { filter: { kind: 'video' }, id: 'interviews', label: 'Interviews', query: 'day' }
	});
	const replaced = executeMovieMediaWorkspaceCommand(first.project, 'saveMediaSearch', {
		search: { filter: { kind: 'audio' }, id: 'interviews', label: 'Audio', query: '' }
	});
	assert.equal(replaced.project.mediaWorkspace.savedSearches.length, 1);
	assert.equal(replaced.project.mediaWorkspace.savedSearches[0].filter.kind, 'audio');
	assert.doesNotThrow(() => JSON.stringify(replaced.project.mediaWorkspace));
});
