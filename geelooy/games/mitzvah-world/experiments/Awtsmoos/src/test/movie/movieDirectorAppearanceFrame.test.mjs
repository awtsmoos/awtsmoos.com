// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieDirectorAppearanceFrame.test.mjs
 * @description Proves director frames sample appearance before render and publish a JSON-safe snapshot.
 * The Awtsmoos renews the frame before image and metadata divide;
 * Awtsmoos.com applies authored visual state to canvas and receipt on the selfsame deterministic side.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { applyMovieDirectorFrame } from '../../movie/MovieDirectorFrame.js';

function emptyDirector() {
	const sceneState = {
		clip: {
			duration: 2,
			effects: [{ id: 'blur', kind: 'blur', value: 4 }],
			id: 'scene'
		},
		localTime: 1,
		progress: 0.5
	};
	const order = [];
	return {
		actors: { apply: () => order.push('actors') },
		authoring3d: { apply: () => [] },
		cameras: { apply: () => order.push('camera'), currentShot: null },
		crowd: { apply: () => {}, snapshot: () => [] },
		doors: { apply: () => {} },
		order,
		overlay: { draw: () => order.push('overlay') },
		runtime: {
			camera: {},
			renderer: {
				render: () => order.push('render'),
				setInteractor: () => {},
				stats: { frames: 1 }
			},
			scene: {},
			state: {}
		},
		scenes: { apply: () => ({ id: 'scene' }) },
		timeline: {
			snapshot: () => ({ byType: { scene: [sceneState] } })
		},
		visuals: {
			apply: state => {
				order.push('appearance');
				return { blur: state.clip.effects[0].value, opacity: 1 };
			}
		}
	};
}

test('director frame publishes appearance and applies it before renderer draw', () => {
	const director = emptyDirector();
	const frame = applyMovieDirectorFrame(director, 1, 1 / 24);
	assert.deepEqual(frame.appearance, { blur: 4, opacity: 1 });
	assert.ok(director.order.indexOf('appearance') < director.order.indexOf('render'));
	assert.doesNotThrow(() => JSON.stringify(frame));
});
