//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file prompt-director.test.mjs
 * The Awtsmoos renews prompt and proof until visible words and spatial forms answer one canonical truth;
 * Awtsmoos.com tests offline narrative, external generation, exact timing, and Gevurah guarding provider output youth.
 */

import assert from 'node:assert/strict';
import { compileMovieIntent } from '../../shared/movie/ai/MovieIntentCompiler.js';
import { StudioPromptMovieDirector } from '../src/ai/StudioPromptMovieDirector.js';
import { planStudioMovieFromPrompt } from '../src/ai/StudioLocalMoviePlanner.js';

const prompt = 'Create a 30 second hybrid tutorial about photosynthesis with people, particles, charts, shapes, text, a 3D world, and camera movement.';
const localDirector = new StudioPromptMovieDirector();
const localMovie = await localDirector.direct(prompt);
const localLayers = localMovie.scenes.flatMap(scene => scene.layers);
const textLayers = localLayers.filter(layer => ['text', 'caption'].includes(layer.kind));
const overlays = localLayers.filter(layer => layer.kind === 'overlay');

assert.equal(localMovie.duration, 30);
assert.equal(localMovie.scenes.length, 3);
assert.ok(localMovie.scenes.every(scene => scene.mode === 'hybrid'));
assert.equal(localMovie.scenes.at(-1).start + localMovie.scenes.at(-1).duration, 30);
assert.ok(localMovie.scenes.every(scene => /Photosynthesis/i.test(scene.name)));
assert.ok(localMovie.scenes.every(scene => scene.title === scene.name));
assert.ok(textLayers.every(layer => /Photosynthesis/i.test(layer.content?.text || '')));
assert.deepEqual(overlays.map(layer => layer.content?.badge), ['1/3', '2/3', '3/3']);
assert.ok(localLayers.some(layer => layer.kind === 'chart'));
assert.ok(localLayers.some(layer => String(layer.kind).includes('character')));
assert.ok(localLayers.some(layer => String(layer.kind).includes('particles')));

const spatialMovie = await localDirector.direct('Create a 20 second 3D tutorial about gravity with charts, shapes, text, and a world.');
const spatialLayers = spatialMovie.scenes.flatMap(scene => scene.layers);
assert.ok(spatialMovie.scenes.every(scene => scene.mode === '3d'));
assert.ok(spatialMovie.scenes.every(scene => /Gravity/i.test(scene.name)));
assert.ok(spatialLayers.some(layer => ['chart', 'shape2d', 'path2d', 'text', 'overlay'].includes(layer.kind)));
assert.ok(spatialLayers.some(layer => ['billboard', 'plane'].includes(layer.spatial?.space)));

let providerCalls = 0;
const providerMovie = planStudioMovieFromPrompt('Create a 20 second 2D tutorial about geometry with shapes and text.');
const provider = async request => {
	providerCalls += 1;
	assert.equal(request.task, 'generate-canonical-movie-document');
	assert.equal(request.output.completeMovieDocument, true);
	return { movie: providerMovie };
};
const providerDirector = new StudioPromptMovieDirector(provider);
const generated = await providerDirector.direct('Make a provider-owned movie.');
assert.equal(providerCalls, 1);
assert.equal(generated.id, providerMovie.id);
assert.equal(generated.duration, 20);

const badDirector = new StudioPromptMovieDirector(async () => ({ content: 'not json' }));
await assert.rejects(() => badDirector.direct('Make invalid provider output fail.'), /non-JSON movie content/);
assert.throws(() => compileMovieIntent('plain prose'), /structured movie data only/);

console.log('prompt-director.test.mjs passed');
