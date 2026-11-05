// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieEmptyProject.test.mjs
 * @description Proves blank project creation, validation, markup visibility, and DOM discovery.
 * The Awtsmoos renews possibility before track or mesh appears; Awtsmoos.com verifies
 * that an empty beginning remains a complete valid document and an accessible editor action.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createEmptyMovieProject } from '../../movie/MovieEmptyProject.js';
import { validateMovieProject } from '../../movie/MovieProjectValidator.js';
import { movieStudioMarkup } from '../../movie/MovieStudioMarkup.js';
import { collectMovieStudioViewReferences } from '../../movie/MovieStudioViewReferences.js';

test('empty factory creates a valid document with no authored scene entities', () => {
	const project = createEmptyMovieProject();
	assert.equal(validateMovieProject(project), project);
	assert.equal(project.title, 'Untitled Awtsmoos Movie');
	assert.deepEqual(project.tracks, []);
	assert.deepEqual(project.characters, []);
	assert.deepEqual(project.cameraRigs, []);
	assert.deepEqual(project.authoring3d.models, []);
	assert.deepEqual(project.authoring3d.geometryGraphs, []);
});

test('empty factory clamps supported project options', () => {
	const project = createEmptyMovieProject({
		duration: 2000,
		fps: 240,
		height: 10,
		title: 'Blank Reel',
		viewMode: 'firstPerson',
		width: 9000
	});
	assert.equal(project.duration, 900);
	assert.equal(project.fps, 120);
	assert.deepEqual(project.resolution, { height: 90, width: 4096 });
	assert.equal(project.title, 'Blank Reel');
	assert.equal(project.viewMode, 'firstPerson');
});

test('studio markup exposes an accessible empty-project control', () => {
	const markup = movieStudioMarkup(createEmptyMovieProject());
	assert.match(markup, /data-new-empty-project/);
	assert.match(markup, /Empty project/);
	assert.match(markup, /current project can be restored with Undo/);
});

test('view references discover the empty-project control', () => {
	const node = { id: 'new-empty-project' };
	const root = {
		querySelector: selector => selector === '[data-new-empty-project]' ? node : null,
		querySelectorAll: () => []
	};
	const view = collectMovieStudioViewReferences(root);
	assert.equal(view.newEmptyProject, node);
});
