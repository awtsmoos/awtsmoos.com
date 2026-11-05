// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import test from 'node:test';
import { executeMovieClipAppearanceCommand } from '../../movie/MovieClipAppearanceCommands.js';

function project() {
	return {
		duration: 10,
		tracks: [{
			clips: [{ duration: 4, id: 'scene', start: 1 }],
			id: 'scenes',
			type: 'scene'
		}]
	};
}

const selection = {
	items: [{ clipId: 'scene', trackId: 'scenes' }],
	primary: { clipId: 'scene', trackId: 'scenes' },
	range: null
};

function execute(source, name, payload) {
	return executeMovieClipAppearanceCommand(source, selection, name, payload);
}

test('appearance commands immutably set transitions, effects, and keyframes', () => {
	const source = project();
	const transitioned = execute(source, 'setClipTransition', {
		edge: 'in',
		transition: { duration: 1, type: 'fade' }
	});
	const effected = execute(transitioned.project, 'upsertClipEffect', {
		effect: { id: 'opacity-main', kind: 'opacity', value: 0.7 }
	});
	const keyed = execute(effected.project, 'addClipEffectKeyframe', {
		effectId: 'opacity-main',
		keyframe: { time: 2, value: 1 }
	});
	assert.equal(source.tracks[0].clips[0].transitionIn, undefined);
	const clip = keyed.project.tracks[0].clips[0];
	assert.equal(clip.transitionIn.duration, 1);
	assert.equal(clip.effects[0].value, 0.7);
	assert.deepEqual(clip.effects[0].keyframes, [{ easing: 'linear', time: 2, value: 1 }]);
	assert.deepEqual(keyed.selection, selection);
	assert.doesNotThrow(() => JSON.stringify(keyed));
});

test('appearance commands replace by id, remove, clear transition, and reject missing effects', () => {
	const source = execute(project(), 'upsertClipEffect', {
		effect: { id: 'blur', kind: 'blur', value: 2 }
	}).project;
	const replaced = execute(source, 'upsertClipEffect', {
		effect: { id: 'blur', kind: 'blur', value: 6 }
	});
	assert.equal(replaced.project.tracks[0].clips[0].effects.length, 1);
	assert.equal(replaced.project.tracks[0].clips[0].effects[0].value, 6);
	const removed = execute(replaced.project, 'removeClipEffect', { effectId: 'blur' });
	assert.deepEqual(removed.project.tracks[0].clips[0].effects, []);
	assert.throws(
		() => execute(project(), 'removeClipEffect', { effectId: 'missing' }),
		/Movie effect missing was not found/
	);
	assert.equal(execute(project(), 'unknown', {}), null);
});
