// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealGameplayCdpInteractions.mjs
 * @description Proves movement, targeting, melee, and Torah casting through real keyboard input.
 * The Awtsmoos joins one intention to one witnessed consequence; Awtsmoos.com openly places one
 * disposable target while every strike, cast, cooldown, damage, defeat, and reward follows runtime law.
 */

import { targetFixtureExpression } from './RealGameplayFixtureExpressions.mjs';
import { keyExpression } from './RealGameplayProofExpressions.mjs';
import { snapshotExpression } from './RealGameplaySnapshotExpression.mjs';

export async function runCdpInteractions(browser, targetId) {
	const before = await snapshot(browser, targetId);
	await key(browser, targetId, 'keydown', 'KeyW', 'w');
	await delay(800);
	await key(browser, targetId, 'keyup', 'KeyW', 'w');
	await delay(120);
	const afterMovement = await snapshot(browser, targetId);
	await tap(browser, targetId, 'Tab', 'Tab');
	await delay(120);
	const selected = await snapshot(browser, targetId);
	const meleeFixture = await applyFixture(browser, targetId);
	await delay(100);
	const targeted = await snapshot(browser, targetId);
	await tap(browser, targetId, 'KeyF', 'f');
	await delay(180);
	const meleeStarted = await snapshot(browser, targetId);
	await delay(1400);
	const meleeSettled = await snapshot(browser, targetId);
	const castFixture = await applyFixture(browser, targetId);
	await delay(100);
	const beforeCast = await snapshot(browser, targetId);
	await tap(browser, targetId, 'Digit1', '1');
	await delay(280);
	const castStarted = await snapshot(browser, targetId);
	await delay(2700);
	const castSettled = await snapshot(browser, targetId);
	return {
		afterMovement,
		before,
		beforeCast,
		cameraMoved: distance(before.camera, afterMovement.camera) > 0.05,
		castFixture,
		castObserved: observedCast(castStarted, castSettled),
		castSettled,
		castStarted,
		damageObserved: healthReduced(targeted.target, meleeSettled.target)
			|| healthReduced(beforeCast.target, castSettled.target),
		keyReleased: !afterMovement.inputKeys.includes('KeyW'),
		meleeFixture,
		meleeObserved: observedMelee(meleeStarted, meleeSettled),
		meleeSettled,
		meleeStarted,
		moved: distance(before.player, afterMovement.player) > 0.05,
		selected,
		targetAcquired: Boolean(selected.target?.id),
		targeted
	};
}

function applyFixture(browser, targetId) {
	return browser.evaluate(targetId, targetFixtureExpression());
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

function observedCast(started, settled) {
	return Boolean(
		started.combat?.casting === 'hebrew-fire'
		|| settled.combat?.lastCompletedAction === 'hebrew-fire'
		|| Number(settled.combat?.cooldowns?.['hebrew-fire'] || 0) > 0
	);
}

function observedMelee(started, settled) {
	return Boolean(
		started.combat?.melee?.actionId === 'staff-light'
		|| settled.combat?.lastCompletedAction === 'staff-light'
	);
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
