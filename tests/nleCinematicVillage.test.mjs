// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module NleCinematicVillageTest
 * @description
 * The village factory must return one deterministic, canonically compilable,
 * package-ready world with houses, trees, movement, rigs, and editable graphs.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { compileMovieProject } from '../geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/movie/MovieProjectCompiler.js';
import {
	createCinematicVillageEnvelope,
	createCinematicVillageProject
} from '../geelooy/social-composer/reel-studio/nle/NleCinematicVillageFactory.js';
import {
	askMovieAgent,
	createMovieAgentRequest
} from '../geelooy/social-composer/reel-studio/nle/NleMovieAgentRequest.js';
import {
	createMoviePackage,
	validateMoviePackage
} from '../geelooy/social-composer/reel-studio/nle/NleMoviePackage.js';

test('factory builds a complete deterministic living village', () => {
	const first = createCinematicVillageProject();
	const second = createCinematicVillageProject();
	const world = first.nle.assets.find(asset => asset.kind === 'cinematic-world').world;
	assert.equal(first.title, 'The Village Awakens — Cinematic World');
	assert.equal(first.duration, 24);
	assert.equal(world.houses.length, 11);
	assert.equal(world.trees.length, 64);
	assert.equal(world.paths.length, 3);
	assert.equal(world.lamps.length, 4);
	assert.deepEqual(first, second);
	assert.equal(world.character.path.length, 5);
});

test('canonical compiler accepts rigs, materials, graphs, and tracks', () => {
	const project = createCinematicVillageProject();
	const compiled = compileMovieProject(project);
	assert.equal(compiled.tracks.length, 8);
	assert.equal(compiled.compiled.cameraRigCount, 5);
	assert.equal(Object.keys(compiled.materialPresets).length, 7);
	assert.equal(project.graphs.filter(graph => graph.kind === 'particle').length, 2);
	assert.equal(project.graphs.filter(graph => graph.kind === 'shader').length, 1);
});

test('AI envelope and movie package are complete and validated', () => {
	const project = createCinematicVillageProject();
	const envelope = createCinematicVillageEnvelope();
	const request = createMovieAgentRequest(project, 'Polish the full village movie.');
	const packageValue = createMoviePackage(project, request);
	const validated = validateMoviePackage(packageValue);
	assert.equal(envelope.schema, 'awtsmoos.ai-movie.v1');
	assert.equal(request.format, 'awtsmoos.movie-request.v1');
	assert.equal(packageValue.format, 'awtsmoos.movie-package.v1');
	assert.equal(validated.validation.renderReady, true);
	assert.equal(packageValue.artifacts.assets.length, project.nle.assets.length);
});

test('agent request is honest without a connected provider', async () => {
	const project = createCinematicVillageProject();
	const request = createMovieAgentRequest(project, 'Improve the camera rhythm.');
	const result = await askMovieAgent(request, null);
	assert.equal(result.connected, false);
	assert.equal(result.status, 'provider-not-connected');
	assert.equal(result.request.prompt, 'Improve the camera rhythm.');
});

test('connected provider receives a cloned complete request', async () => {
	const project = createCinematicVillageProject();
	const request = createMovieAgentRequest(project, 'Return a ready package.');
	const result = await askMovieAgent(request, async value => {
		value.prompt = 'provider copy';
		return { format: 'awtsmoos.movie-package.v1' };
	});
	assert.equal(result.connected, true);
	assert.equal(request.prompt, 'Return a ready package.');
	assert.equal(result.response.format, 'awtsmoos.movie-package.v1');
});
