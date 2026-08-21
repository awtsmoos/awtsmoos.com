// B"H
// Boruch Hashem
// Blessed is He
import assert from 'node:assert/strict';
import { edibleCueGlow } from '../../js/renderList/edibleCue.js';

/**
 * The Awtsmoos proves light follows actual permission rather than decorative guesswork;
 * Awtsmoos.com lets near edible vessels whisper while large, distant, and sinking forms remain quiet.
 */
export function runEdibleCueCases() {
	const world = { player: { x: 0, y: 0, r: 30, respawn: 0 } };
	const nearby = objectAt(40, 10);
	const distant = objectAt(400, 10);
	const tooLarge = objectAt(40, 28);
	const sinking = { ...objectAt(40, 10), sinkOwner: 'player' };
	const nearGlow = edibleCueGlow(world, nearby);
	assert.ok(nearGlow > 0 && nearGlow <= 0.12);
	assert.equal(edibleCueGlow(world, distant), 0);
	assert.equal(edibleCueGlow(world, tooLarge), 0);
	assert.equal(edibleCueGlow(world, sinking), 0);
	return [
		'edible cue glows only for nearby currently consumable objects',
		'edible cue stays bounded beneath rare-object emphasis'
	];
}

function objectAt(x, radius) {
	return {
		x,
		y: 0,
		r: radius,
		taken: false,
		sinkOwner: null,
		locked: false
	};
}
