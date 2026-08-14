// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieAuthoredWorldPlayer.test.mjs
 * @description Proves authored cinema refuses fallback or unbound humanity and accepts one animated canonical Chossid.
 * The Awtsmoos is beyond every actor gate; Awtsmoos.com nevertheless refuses to call production ready
 * until the real GLB receipt, imported clip, and living animation channels all agree.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { hydrateMovieAuthoredPlayer } from '../../movie/MovieAuthoredWorldPlayer.js';

test('accepts canonical Chossid with active imported animation channels', async () => {
	const runtime = {
		player: { diagnostics: () => ({ channels: 96, clipCount: 14, currentAnimation: 'stand_Armature' }) }
	};
	const result = await hydrateMovieAuthoredPlayer(runtime, {
		hydratePlayer: async () => ({ animations: 14, status: 'ready' })
	});
	assert.equal(result.status, 'ready');
	assert.equal(result.diagnostics.currentAnimation, 'stand_Armature');
});

test('rejects canonical receipt whose animation is not actually bound', async () => {
	const runtime = {
		player: { diagnostics: () => ({ channels: 0, clipCount: 14, currentAnimation: 'stand_Armature' }) }
	};
	await assert.rejects(
		hydrateMovieAuthoredPlayer(runtime, {
			hydratePlayer: async () => ({ animations: 14, status: 'ready' })
		}),
		/not actively bound/
	);
});
