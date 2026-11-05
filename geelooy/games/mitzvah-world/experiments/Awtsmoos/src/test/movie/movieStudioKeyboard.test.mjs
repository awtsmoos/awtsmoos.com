// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieStudioKeyboard.test.mjs
 * @description Proves guarded transport, history, edit, marker, and snapping shortcuts.
 * The Awtsmoos renews intention before every key; Awtsmoos.com verifies that text entry
 * remains untouched while finite creative commands are prevented and routed exactly once.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	handleMovieStudioKey,
	isMovieTextEntry
} from '../../movie/MovieStudioKeyboard.js';

function createController() {
	const calls = [];
	const controller = {
		pause: () => calls.push('pause'),
		session: {
			commands: { run: name => calls.push(name) },
			director: { playing: false },
			play: () => calls.push('play'),
			project: { duration: 12 },
			seek: time => calls.push(`seek:${time}`)
		},
		toggleInspector: open => calls.push(`inspector:${open}`)
	};
	return { calls, controller };
}

function keyEvent(key, options = {}) {
	let prevented = false;
	return {
		altKey: false,
		code: options.code || '',
		ctrlKey: false,
		key,
		metaKey: false,
		preventDefault: () => { prevented = true; },
		shiftKey: false,
		target: null,
		...options,
		wasPrevented: () => prevented
	};
}

test('command shortcuts route undo, redo, split, and duplicate', () => {
	const { calls, controller } = createController();
	for (const event of [
		keyEvent('z', { metaKey: true }),
		keyEvent('z', { metaKey: true, shiftKey: true }),
		keyEvent('b', { ctrlKey: true }),
		keyEvent('d', { ctrlKey: true })
	]) {
		assert.equal(handleMovieStudioKey(controller, event), true);
		assert.equal(event.wasPrevented(), true);
	}
	assert.deepEqual(calls, ['undo', 'redo', 'split', 'duplicate']);
});

test('single-key edit shortcuts route delete, marker, and snapping', () => {
	const { calls, controller } = createController();
	handleMovieStudioKey(controller, keyEvent('Delete'));
	handleMovieStudioKey(controller, keyEvent('m'));
	handleMovieStudioKey(controller, keyEvent('s'));
	assert.deepEqual(calls, ['delete', 'addMarker', 'toggleSnap']);
});

test('transport and inspector shortcuts retain existing behavior', () => {
	const { calls, controller } = createController();
	handleMovieStudioKey(controller, keyEvent(' ', { code: 'Space' }));
	controller.session.director.playing = true;
	handleMovieStudioKey(controller, keyEvent(' ', { code: 'Space' }));
	handleMovieStudioKey(controller, keyEvent('Home'));
	handleMovieStudioKey(controller, keyEvent('End'));
	handleMovieStudioKey(controller, keyEvent('Escape'));
	assert.deepEqual(calls, [
		'play', 'pause', 'seek:0', 'seek:12', 'inspector:false'
	]);
});

test('editable targets suppress every shortcut', () => {
	const { calls, controller } = createController();
	const target = { closest: selector => selector.includes('input') ? target : null };
	const event = keyEvent('z', { metaKey: true, target });
	assert.equal(isMovieTextEntry(target), true);
	assert.equal(handleMovieStudioKey(controller, event), false);
	assert.deepEqual(calls, []);
	assert.equal(event.wasPrevented(), false);
});
