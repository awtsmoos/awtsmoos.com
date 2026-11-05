// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieProjectCompiler.test.mjs
 * @description Proves nested sequences, camera rigs, material graphs, and cycle rejection.
 * The Awtsmoos renews stories within stories without confusion; Awtsmoos.com compiles
 * every nested intention into bounded deterministic tracks before playback.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { compileMovieProject } from '../../movie/MovieProjectCompiler.js';

function project() {
	return {
		duration: 20,
		fps: 24,
		materialGraphs: [{
			edges: [
				{ from: 'color', input: 'color', to: 'out' },
				{ from: 'texture', input: 'texture', to: 'out' }
			],
			id: 'warm',
			nodes: [
				{ id: 'color', type: 'color', value: '#ffcc88' },
				{ id: 'texture', type: 'texture', url: 'https://awtsmoos-docs-base.web.app/materials/FULL%20SIZE/gold%202.png' },
				{ id: 'out', type: 'output', value: { mix: 0.8 } }
			]
		}],
		resolution: { height: 360, width: 640 },
		sequences: [{
			id: 'walk',
			tracks: [{
				clips: [{ action: 'walk', duration: 4, start: 0 }],
				id: 'crowd',
				target: 'person',
				type: 'crowd'
			}]
		}],
		tracks: [
			{
				clips: [{ duration: 4, id: 'nested', sequenceId: 'walk', start: 3 }],
				id: 'sequences',
				type: 'sequence'
			},
			{
				clips: [{
					anchor: { x: 2, y: 0, z: 4 },
					duration: 5,
					rig: 'dollyIn',
					start: 0,
					target: { x: 0, y: 2, z: 0 }
				}],
				id: 'camera',
				type: 'camera'
			}
		]
	};
}

test('compiler expands nested tracks, rigs, and material graphs', () => {
	const compiled = compileMovieProject(project());
	const crowd = compiled.tracks.find(track => track.type === 'crowd');
	const camera = compiled.tracks.find(track => track.type === 'camera');
	assert.equal(crowd.clips[0].start, 3);
	assert.equal(crowd.clips[0].duration, 4);
	assert.ok(camera.clips[0].from.position);
	assert.ok(camera.clips[0].to.position);
	assert.equal(compiled.materialPresets.warm.color, '#ffcc88');
	assert.equal(compiled.materialPresets.warm.mix, 0.8);
	assert.equal(compiled.compiled.sequenceCount, 1);
});

test('compiler rejects nested sequence cycles', () => {
	const source = project();
	source.sequences = [
		{ id: 'a', tracks: [{ id: 'a-to-b', type: 'sequence', clips: [{ duration: 1, sequenceId: 'b', start: 0 }] }] },
		{ id: 'b', tracks: [{ id: 'b-to-a', type: 'sequence', clips: [{ duration: 1, sequenceId: 'a', start: 0 }] }] }
	];
	source.tracks[0].clips[0].sequenceId = 'a';
	assert.throws(() => compileMovieProject(source), /cycle/i);
});
