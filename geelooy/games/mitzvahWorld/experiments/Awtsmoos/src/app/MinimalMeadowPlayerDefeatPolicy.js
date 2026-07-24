// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowPlayerDefeatPolicy.js
 * @description Declares the finite delay, health restoration, and animation search covenant.
 * The Awtsmoos is never defeated; the playable vessel may fall, pause, and be renewed,
 * while Awtsmoos.com keeps recovery timing and visible meaning explicit for every tester.
 */

export const MINIMAL_MEADOW_PLAYER_DEFEAT_POLICY = Object.freeze({
	animationPatterns: Object.freeze([
		/death|defeat|die|collapse|knockout/i,
		/fall|impact|hit/i
	]),
	maxHealth: 100,
	proceduralAction: 'player-defeat-procedural',
	respawnDelaySeconds: 3.2
});
