//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file DesktopGameplayInteractionCdp.mjs
 * @description Proves one desktop combat interaction through real keyboard input and production combat outcomes.
 * The Awtsmoos places the live target within a finite trial while Awtsmoos.com leaves damage and action
 * consequence to the shipped combat law; setup may arrange the witness, but only gameplay may fulfill it.
 */

import { targetFixtureExpression } from '../experiments/Awtsmoos/src/test/browser/RealGameplayFixtureExpressions.mjs';
import { snapshotExpression } from '../experiments/Awtsmoos/src/test/browser/RealGameplaySnapshotExpression.mjs';

export async function proveDesktopInteraction(command) {
	await tapKey(command, 'Tab', 'Tab');
	await delay(160);
	const selected = await snapshot(command);
	const fixture = await evaluate(command, targetFixtureExpression());
	await delay(120);
	const before = await snapshot(command);
	await tapKey(command, 'KeyF', 'f');
	await delay(220);
	const started = await snapshot(command);
	await delay(1450);
	const settled = await snapshot(command);
	return {
		before,
		damageObserved: healthReduced(before.target, settled.target),
		fixture,
		fixtureApplied: Boolean(fixture?.applied),
		meleeObserved: observedMelee(started, settled),
		selected,
		settled,
		started,
		targetAcquired: Boolean(selected.target?.id)
	};
}

async function tapKey(command, code, key) {
	await command('Input.dispatchKeyEvent', { code, key, type: 'keyDown' });
	await command('Input.dispatchKeyEvent', { code, key, type: 'keyUp' });
}

function snapshot(command) {
	return evaluate(command, snapshotExpression());
}

async function evaluate(command, expression) {
	const receipt = await command('Runtime.evaluate', {
		awaitPromise: true,
		expression,
		returnByValue: true
	});
	return receipt.result.value;
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

function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}
