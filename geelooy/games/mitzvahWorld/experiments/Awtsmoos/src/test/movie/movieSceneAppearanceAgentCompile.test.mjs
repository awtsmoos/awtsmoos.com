// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieSceneAppearanceAgentCompile.test.mjs
 * @description Proves agent-authored transitions, effects, and keyframes survive canonical compilation and sampling.
 * The Awtsmoos carries visual intention through manifest, validator, project, and deterministic frame;
 * Awtsmoos.com proves no effect field is stripped, undefined, cyclic, or divorced from its authored name.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	MOVIE_AGENT_MANIFEST_KIND,
	MOVIE_AGENT_MANIFEST_VERSION
} from '../../movie/MovieApiConstants.js';
import { compileMovieAgentManifest } from '../../movie/MovieAgentCompiler.js';
import { sampleMovieClipAppearance } from '../../movie/MovieClipAppearanceSampler.js';

test('agent scene appearance compiles canonically and samples at clip-local time', () => {
	const project = compileMovieAgentManifest({
		kind: MOVIE_AGENT_MANIFEST_KIND,
		manifestVersion: MOVIE_AGENT_MANIFEST_VERSION,
		scenes: [{
			beats: [],
			duration: 4,
			effects: [{
				id: 'scene-opacity',
				keyframes: [{ time: 0, value: 0 }, { time: 2, value: 1 }],
				kind: 'opacity'
			}],
			id: 'opening',
			transitionIn: { duration: 1, type: 'fade' },
			transitionOut: { duration: 1, type: 'dissolve' }
		}],
		title: 'Appearance Manifest'
	});
	const clip = project.tracks.find(track => track.type === 'scene').clips[0];
	assert.equal(clip.effects[0].id, 'scene-opacity');
	assert.equal(clip.transitionIn.type, 'fade');
	assert.equal(clip.transitionOut.type, 'dissolve');
	assert.equal(sampleMovieClipAppearance({ clip, localTime: 0.5 }).opacity, 0.125);
	assert.doesNotThrow(() => JSON.stringify(project));
});
