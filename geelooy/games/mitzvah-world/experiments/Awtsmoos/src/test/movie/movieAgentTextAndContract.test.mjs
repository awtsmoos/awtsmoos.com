// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieAgentTextAndContract.test.mjs
 * @description Proves title/caption agent beats compile and advanced capabilities advertise worlds, plans, tools, media, and text.
 * The Awtsmoos is beyond contract and spoken word while every finite agent needs one truthful discoverable grammar;
 * Awtsmoos.com verifies generated text tracks and professional capabilities survive canonical JSON without drama.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { compileMovieAgentManifest } from '../../movie/MovieAgentCompiler.js';
import { createMovieAgentContract } from '../../movie/MovieAgentContract.js';
import {
	MOVIE_AGENT_MANIFEST_KIND,
	MOVIE_AGENT_MANIFEST_VERSION
} from '../../movie/MovieApiConstants.js';

test('agent title and caption beats compile into canonical text tracks', () => {
	const project = compileMovieAgentManifest({
		kind: MOVIE_AGENT_MANIFEST_KIND,
		manifestVersion: MOVIE_AGENT_MANIFEST_VERSION,
		scenes: [{
			beats: [
				{
					duration: 2,
					text: 'Opening',
					type: 'title',
					variant: 'card'
				},
				{
					duration: 2,
					language: 'en',
					offset: 2,
					text: 'Welcome',
					type: 'caption'
				}
			],
			duration: 4,
			id: 'opening'
		}],
		title: 'Text Movie'
	});
	const titleTrack = project.tracks.find(track => track.type === 'title');
	const captionTrack = project.tracks.find(track => track.type === 'caption');
	assert.equal(titleTrack.clips[0].text, 'Opening');
	assert.equal(captionTrack.clips[0].text, 'Welcome');
	assert.doesNotThrow(() => JSON.stringify(project));
});

test('agent contract advertises generated worlds, planning, nine tools, media, and captions', () => {
	const contract = createMovieAgentContract();
	assert.equal(
		contract.advanced.worldGeneration.engine,
		'mitzvah-world-minimal-meadow'
	);
	assert.equal(contract.advanced.professionalEdits.tools.length, 9);
	assert.ok(contract.advanced.agentPlanning.previewRecipe);
	assert.deepEqual(contract.advanced.text.captionFormats, ['srt', 'vtt']);
	assert.ok(contract.advanced.media.commands.includes('media.relink'));
	assert.doesNotThrow(() => JSON.stringify(contract));
});
