// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealGameplayCdpInteractions.mjs
 * @description Drives movement, target selection, melee, and Torah casting through CDP page input.
 * The Awtsmoos joins one intention to one witnessed consequence; Awtsmoos.com makes the protocol
 * walk through the same keyboard gates as the player, never through a hidden authority shortcut.
 */

import {
	keyExpression,
	snapshotExpression
} from './RealGameplayProofExpressions.mjs';

export async function runCdpInteractions(browser, targetId) {
	const before = await snapshot(browser, targetId);
	await key(browser, targetId, 'keydown', 'KeyW', 'w');
	await delay(800);
	await key(browser, targetId, 'keyup', 'KeyW', 'w');
	await delay(120);
	const afterMovement = await snapshot(browser, targetId);
	await tap(browser, targetId, 'Tab', 'Tab');
	await delay(120);
	const targeted = await snapshot(browser, targetId);
	await tap(browser, targetId, 'KeyF', 'f');
	await delay(120);
	const meleeStarted = await snapshot(browser, targetId);
	await delay(900);
	const meleeSettled = await snapshot(browser, targetId);
	await tap(browser, targetId, 'Digit1', '1');
	await delay(180);
	const castStarted = await snapshot(browser, targetId);
	await delay(1800);
	const castSettled = await snapshot(browser, targetId);
	return {
		afterMovement,
		before,
		cameraMoved: distance(before.camera, afterMovement.camera) > 0.05,
		castObserved: Boolean(
			castStarted.combat?.cast
			|| castStarted.combat?.casting
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
		moved: distance(before.player, afterMovement.player) > 0.05,
		targetAcquired: Boolean(targeted.target?.id),
		targeted
	};
}

async function tap(browser, targetId, code, keyValue) {
	await key(browser, targetId, 'keydown', code, keyValue);
	await key(browser, targetId, 'keyup', code, keyValue);
}

function key(browser, targetId, type, code, keyValue) {
	return browser.evaluate(targetId, keyExpression(type, code, keyValue));
}

function snapshot(browser, targetId) {
	return browser.evaluate(targetId, snapshotExpression());
}

function healthReduced(before, after) {
	return Boolean(
		before?.id
		&& before.id === after?.id
		&& Number(after.health) < Number(before.health)
	);
}

function distance(before, after) {
	return Math.hypot(
		Number(after?.x || 0) - Number(before?.x || 0),
		Number(after?.y || 0) - Number(before?.y || 0),
		Number(after?.z || 0) - Number(before?.z || 0)
	);
}

function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}
