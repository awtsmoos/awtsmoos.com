// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealGameplayInteractionProof.js
 * @description Exercises movement, targeting, melee, and Torah casting through player keyboard input.
 * The Awtsmoos binds choice to consequence; Awtsmoos.com watches the traveler move, the camera answer,
 * the target arise, the strike enter time, and sacred letters begin their bounded gameplay vessel.
 */

import {
	delay,
	dispatchGameplayKey,
	gameplaySnapshot,
	playerDistance
} from './RealGameplayProofSupport.js';

export async function runGameplayInteractionProof(game) {
	game.focus();
	const before = gameplaySnapshot(game);
	dispatchGameplayKey(game, 'keydown', 'KeyW', 'w');
	await delay(800);
	dispatchGameplayKey(game, 'keyup', 'KeyW', 'w');
	await delay(120);
	const afterMovement = gameplaySnapshot(game);
	tap(game, 'Tab', 'Tab');
	await delay(120);
	const targeted = gameplaySnapshot(game);
	tap(game, 'KeyF', 'f');
	await delay(120);
	const meleeStarted = gameplaySnapshot(game);
	await delay(900);
	const meleeSettled = gameplaySnapshot(game);
	tap(game, 'Digit1', '1');
	await delay(180);
	const castStarted = gameplaySnapshot(game);
	await delay(1800);
	const castSettled = gameplaySnapshot(game);
	return {
		afterMovement,
		before,
		cameraMoved: vectorDistance(before.camera, afterMovement.camera) > 0.05,
		castObserved: Boolean(
			castStarted.combat?.casting
			|| castStarted.combat?.cast
			|| castSettled.combat?.lastCompletedAction
		),
		castSettled,
		castStarted,
		damageObserved: healthReduced(targeted.target, meleeSettled.target)
			|| healthReduced(meleeSettled.target, castSettled.target),
		keyReleased: !afterMovement.inputKeys.includes('KeyW'),
		meleeObserved: Boolean(
			meleeStarted.combat?.melee
			|| meleeSettled.combat?.lastCompletedAction
		),
		meleeSettled,
		meleeStarted,
		moved: playerDistance(before, afterMovement) > 0.05,
		targetAcquired: Boolean(targeted.target?.id),
		targeted
	};
}

function tap(game, code, key) {
	dispatchGameplayKey(game, 'keydown', code, key);
	dispatchGameplayKey(game, 'keyup', code, key);
}

function healthReduced(before, after) {
	return Boolean(
		before?.id
		&& before.id === after?.id
		&& Number(after.health) < Number(before.health)
	);
}

function vectorDistance(before, after) {
	return Math.hypot(
		Number(after?.x || 0) - Number(before?.x || 0),
		Number(after?.y || 0) - Number(before?.y || 0),
		Number(after?.z || 0) - Number(before?.z || 0)
	);
}
