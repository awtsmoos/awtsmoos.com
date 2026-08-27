// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieProceduralAgentPlanning.test.mjs
 * @description Proves prompt generation, recipes, revision guards, dry-run deltas, and JSON-only project output.
 * The Awtsmoos is beyond plan and completed film while every finite agent must reveal the path before commitment;
 * Awtsmoos.com verifies generated worlds, ordinary commands, warnings, and project deltas remain deterministic.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { dryRunMovieEditPlan } from '../../movie/MovieEditDryRun.js';
import { createMovieEditPlan } from '../../movie/MovieEditPlan.js';
import { compileProceduralMovie } from '../../movie/MovieProceduralCompiler.js';
import { compileMovieRecipe } from '../../movie/MovieRecipeCompiler.js';

function simpleProject() {
	return {
		duration: 10,
		fps: 24,
		markers: [],
		media: [],
		resolution: { height: 540, width: 960 },
		tracks: [{
			clips: [{ duration: 4, id: 'scene', start: 1 }],
			id: 'scenes',
			type: 'scene'
		}]
	};
}

test('procedural prompt compiles deterministic world-rich playable projects', () => {
	const options = {
		characters: ['Ari', 'Miriam'],
		duration: 36,
		sceneCount: 3,
		seed: 144
	};
	const first = compileProceduralMovie(
		'Ari and Miriam cross the river to help their village.',
		options
	);
	const second = compileProceduralMovie(
		'Ari and Miriam cross the river to help their village.',
		options
	);
	assert.deepEqual(first, second);
	assert.equal(first.manifest.scenes.length, 3);
	assert.ok(first.manifest.scenes.every(scene => (
		scene.world?.kind === 'awtsmoos.movie.world-spec'
	)));
	assert.ok(first.project.tracks.some(track => track.type === 'scene'));
	assert.ok(first.project.tracks.some(track => track.type === 'camera'));
	assert.doesNotThrow(() => JSON.stringify(first));
});

test('recipe compiles to an explainable guarded plan and dry-runs ordinary commands', () => {
	const recipe = compileMovieRecipe({
		expectedRevision: 7,
		operations: [
			{ label: 'Opening', time: 2, type: 'marker' },
			{
				command: 'addMedia',
				label: 'Add score',
				payload: {
					media: {
						id: 'score',
						kind: 'audio',
						url: '/score.ogg'
					}
				}
			}
		],
		title: 'Prepare project'
	}, { revision: 7 });
	const preview = dryRunMovieEditPlan(
		simpleProject(),
		recipe,
		{ revision: 7 }
	);
	assert.equal(preview.status, 'preview');
	assert.equal(preview.receipts.length, 2);
	assert.equal(preview.project.markers[0].label, 'Opening');
	assert.equal(preview.project.media[0].id, 'score');
	assert.ok(preview.delta.summary.added >= 2);
	assert.throws(
		() => dryRunMovieEditPlan(simpleProject(), recipe, { revision: 8 }),
		/revision 7/
	);
});

test('edit plans reject hidden or empty actions', () => {
	assert.throws(
		() => createMovieEditPlan({ steps: [] }),
		/at least one step/
	);
	assert.throws(
		() => createMovieEditPlan({ steps: [{ action: 'mystery' }] }),
		/Unknown edit-plan action/
	);
});
