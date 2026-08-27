// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieDirectorFrame.test.mjs
 * @description Proves deterministic frames work with absent or revealed shadow capability.
 * The Awtsmoos casts form before any shadow can testify; Awtsmoos.com verifies that
 * the renderer remains required while an optional shadow vessel may appear or remain hidden.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	applyMovieDirectorFrame,
	updateMovieShadows
} from '../../movie/MovieDirectorFrame.js';

function createDirector(runtimeOverrides = {}) {
	const calls = [];
	const runtime = {
		camera: {},
		renderer: {
			canvas: {},
			stats: { frames: 1 },
			render() {
				calls.push('render');
			},
			setInteractor() {
				calls.push('interactor');
			}
		},
		scene: {},
		state: {},
		...runtimeOverrides
	};
	return {
		calls,
		director: {
			actors: { apply: () => calls.push('actors') },
			cameras: { apply: () => calls.push('camera'), currentShot: 'wide' },
			crowd: {
				apply: () => calls.push('crowd'),
				snapshot: () => []
			},
			doors: { apply: () => calls.push('doors') },
			overlay: { draw: () => calls.push('overlay') },
			runtime,
			scenes: { apply: () => null },
			timeline: { snapshot: () => ({ byType: {} }) },
			visuals: {
				apply: () => {
					calls.push('visuals');
					return { opacity: 1 };
				}
			}
		}
	};
}

test('director frame renders when shadows are absent', () => {
	const { calls, director } = createDirector();
	const frame = applyMovieDirectorFrame(director, 2, 1 / 30);
	assert.equal(frame.time, 2);
	assert.deepEqual(calls, [
		'actors', 'crowd', 'doors', 'camera',
		'visuals', 'interactor', 'render', 'overlay'
	]);
	assert.deepEqual(frame.appearance, { opacity: 1 });
});

test('shadow update receives the available runtime vessels', () => {
	let received = null;
	const runtime = {
		ground: { id: 'ground' },
		npc: { id: 'npc' },
		shadows: { update: value => { received = value; } },
		state: { id: 'state' },
		worldMode: 'movie'
	};
	updateMovieShadows(runtime);
	assert.deepEqual(received, {
		ground: runtime.ground,
		npc: runtime.npc,
		state: runtime.state,
		worldMode: 'movie'
	});
});
