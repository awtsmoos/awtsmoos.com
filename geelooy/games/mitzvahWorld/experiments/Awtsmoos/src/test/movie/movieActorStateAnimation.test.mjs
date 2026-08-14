// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieActorStateAnimation.test.mjs
 * @description Proves Movie animation requests preserve exact exported Chossid clips and prefer living semantic motion.
 * The Awtsmoos is beyond stillness and motion while the finite Short may ask for either by name;
 * Awtsmoos.com keeps every authored clip reachable without letting a static pose accidentally replace living movement.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveMovieActorAnimation } from '../../movie/MovieActorState.js';

function runtimeWith(clips) {
	return {
		clips: {},
		player: {
			clips,
			names: clips.map(clip => clip.name)
		}
	};
}

test('talk prefers positive-duration stand over zero-duration hands-out pose', () => {
	const runtime = runtimeWith([
		{ duration: 0, name: 'hands-out' },
		{ duration: 0, name: 'neutral_Armature' },
		{ duration: 5.033, name: 'stand_Armature' }
	]);
	assert.equal(resolveMovieActorAnimation(runtime, 'player', 'talk'), 'stand_Armature');
});

test('semantic alias falls back to an authored pose when no moving match exists', () => {
	const runtime = runtimeWith([{ duration: 0, name: 'hands-out' }]);
	assert.equal(resolveMovieActorAnimation(runtime, 'player', 'talk'), 'hands-out');
});

test('exact exported animation names remain first-class Movie requests', () => {
	const runtime = runtimeWith([
		{ duration: 1.566, name: 'punch' },
		{ duration: 5.1, name: 'dance hip hop_Armature' },
		{ duration: 0, name: 'neutral_Armature' }
	]);
	assert.equal(resolveMovieActorAnimation(runtime, 'player', 'punch'), 'punch');
	assert.equal(resolveMovieActorAnimation(runtime, 'player', 'dance hip hop_Armature'), 'dance hip hop_Armature');
	assert.equal(resolveMovieActorAnimation(runtime, 'player', 'neutral_Armature'), 'neutral_Armature');
});

test('expanded semantic aliases select their moving imported clips', () => {
	const runtime = runtimeWith([
		{ duration: 4.367, name: 'dance silly_Armature' },
		{ duration: 2.233, name: 'stab' },
		{ duration: 2.133, name: 'falling_Armature' }
	]);
	assert.equal(resolveMovieActorAnimation(runtime, 'player', 'danceSilly'), 'dance silly_Armature');
	assert.equal(resolveMovieActorAnimation(runtime, 'player', 'stab'), 'stab');
	assert.equal(resolveMovieActorAnimation(runtime, 'player', 'fall'), 'falling_Armature');
});
