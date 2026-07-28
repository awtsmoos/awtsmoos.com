// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module NleAiMovieContractTest
 * @description
 * Another AI receives one complete bounded village envelope or package while the
 * NLE preserves canonical validation, cloning, action parity, history, and ownership.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import {
	AI_MOVIE_MAX_BYTES,
	AI_MOVIE_SCHEMA,
	createAiMovieEnvelope
} from '../geelooy/social-composer/reel-studio/nle/NleAiContract.js';
import { decodeAiMovieSource } from '../geelooy/social-composer/reel-studio/nle/NleAiProjectCodec.js';
import { createNleAiPublicApi } from '../geelooy/social-composer/reel-studio/nle/NleAiPublicApi.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = relativePath => fs.readFileSync(path.join(root, relativePath), 'utf8');
const json = relativePath => JSON.parse(read(relativePath));
const starterPath = 'geelooy/social-composer/reel-studio/projects/hyperreal-cinematic-starter.json';
const packagePath = 'geelooy/social-composer/reel-studio/projects/cinematic-village-package.json';
const schemaPath = 'geelooy/social-composer/reel-studio/api/ai-movie-schema-v1.json';

test('schema and village starter expose one complete AI movie envelope', () => {
	const schema = json(schemaPath);
	const starter = json(starterPath);
	assert.equal(schema.properties.schema.const, AI_MOVIE_SCHEMA);
	assert.deepEqual(schema.required, ['schema', 'creativeBrief', 'project']);
	assert.equal(starter.schema, AI_MOVIE_SCHEMA);
	assert.match(starter.creativeBrief.visualLanguage, /WebGL|cinematic/i);
	assert.ok(starter.creativeBrief.continuity.length >= 4);
	assert.ok(starter.creativeBrief.assetRequests.length >= 4);
});

test('starter passes canonical normalization with the complete living world', () => {
	const project = decodeAiMovieSource(json(starterPath));
	const world = project.nle.assets.find(asset => asset.kind === 'cinematic-world').world;
	assert.equal(project.title, 'The Village Awakens — Cinematic World');
	assert.equal(project.duration, 24);
	assert.equal(project.ai.contract, AI_MOVIE_SCHEMA);
	assert.equal(world.houses.length, 11);
	assert.equal(world.trees.length, 64);
	assert.equal(project.materialGraphs.length, 7);
	assert.equal(project.graphs.length, 3);
	assert.equal(project.tracks.find(track => track.type === 'camera').clips.length, 5);
});

test('AI export is complete and detached from editor state', () => {
	const project = decodeAiMovieSource(json(starterPath));
	const envelope = createAiMovieEnvelope(project);
	envelope.project.title = 'Changed export';
	envelope.project.nle.assets[0].world.houses.push({ id: 'export-only' });
	envelope.creativeBrief.continuity.push('Changed export only');
	assert.notEqual(project.title, envelope.project.title);
	assert.equal(project.nle.assets[0].world.houses.length, 11);
	assert.ok(!project.ai.creativeBrief.continuity.includes('Changed export only'));
});

test('raw project and complete movie package remain accepted', () => {
	const raw = json(starterPath).project;
	const packageValue = json(packagePath);
	assert.equal(decodeAiMovieSource(JSON.stringify(raw)).title, raw.title);
	assert.equal(decodeAiMovieSource(packageValue).title, packageValue.project.title);
});

test('malformed, unsupported, and oversized AI sources are rejected', () => {
	assert.throws(() => decodeAiMovieSource('{broken'), /invalid/i);
	assert.throws(() => decodeAiMovieSource({ project: {}, schema: 'other.movie.v9' }), /Unsupported/);
	const oversized = JSON.stringify({ value: 'x'.repeat(AI_MOVIE_MAX_BYTES) });
	assert.throws(() => decodeAiMovieSource(oversized), /exceeds/);
});

test('public AI API is frozen and shares the generated action API', async () => {
	const calls = [];
	const actionApi = Object.freeze({ list: () => [], validate: () => true });
	const app = { actionApi, ai: {
		applySource: value => calls.push(['apply', value]),
		exportEnvelope: () => ({ schema: AI_MOVIE_SCHEMA }),
		loadSchema: async () => ({ title: 'schema' }),
		loadStarter: async () => ({ schema: AI_MOVIE_SCHEMA })
	} };
	const api = createNleAiPublicApi(app);
	assert.equal(api.actions, actionApi);
	assert.equal(api.schema, AI_MOVIE_SCHEMA);
	assert.ok(Object.isFrozen(api));
	api.apply({ project: {} });
	assert.equal(calls[0][0], 'apply');
	assert.equal((await api.loadSchema()).title, 'schema');
});

test('shell, lifecycle, actions, WebGL, and cache manifests expose the full studio', () => {
	assert.ok(read('geelooy/social-composer/reel-studio/nle/NleShell.js').includes('data-nle-ai'));
	assert.ok(read('geelooy/social-composer/reel-studio/nle/NleApp.js').includes('createNleMovieActionApi'));
	assert.ok(read('geelooy/social-composer/reel-studio/nle/NlePublicApi.js').includes('actions'));
	assert.ok(read('geelooy/social-composer/reel-studio/nle/NleCompositor.js').includes('NleWebGlWorldRenderer'));
	assert.ok(read('geelooy/social-composer/reel-studio/nle/styles/index.css').includes('action-panel.css'));
	assert.ok(read('geelooy/social-composer/reel-studio/index.html').includes('social-nle-004'));
});

test('all AI source and style owners stay under the hard ceiling', () => {
	for (const folder of ['geelooy/social-composer/reel-studio/nle', 'geelooy/social-composer/reel-studio/nle/styles']) {
		for (const name of fs.readdirSync(path.join(root, folder)).filter(name => /^NleAi.*\.js$|^(ai-studio|action-panel).*\.css$/.test(name))) {
			const lines = read(`${folder}/${name}`).split('\n').length;
			assert.ok(lines <= 121, `${name}: ${lines}`);
		}
	}
});
