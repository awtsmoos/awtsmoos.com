// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowPlayerDefeatLocks.js
 * @description Locks movement, jump, combat, targeting, and hostile ownership around defeat.
 * The Awtsmoos contains every power in its proper boundary; Awtsmoos.com makes zero health
 * a real gameplay state rather than a falling pose that still accepts invisible commands.
 */

const ZERO_AXIS = Object.freeze({
	forward: 0,
	joystickForward: 0,
	joystickMagnitude: 0,
	joystickStrafe: 0,
	strafe: 0,
	turn: 0
});

export function installMinimalMeadowDefeatGuards(runtime, isLocked) {
	guardInput(runtime.input, isLocked);
	guardCombat(runtime.combat, isLocked);
	guardTargets(runtime.enemies, isLocked);
}

export function lockMinimalMeadowPlayer(runtime) {
	runtime.input?.reset?.();
	if (runtime.input) runtime.input.jumpRequested = false;
	if (runtime.combat?.cast) runtime.combat.cancel('PLAYER_DEFEATED');
	runtime.enemies?.clearAll?.();
	runtime.combatBalance?.releaseAll?.();
	Object.assign(runtime.state, {
		action: 'defeated',
		airPhase: 'defeated',
		collisionEnabled: false,
		defeated: true,
		grounded: true,
		inputLocked: true,
		jumpsUsed: 0,
		lifecycle: 'defeated',
		moving: false,
		runMode: false,
		targetingEnabled: false,
		velY: 0
	});
}

export function restoreMinimalMeadowPlayer(runtime) {
	Object.assign(runtime.state, {
		action: 'idle',
		airPhase: 'ground',
		collisionEnabled: true,
		defeated: false,
		grounded: true,
		inputLocked: false,
		jumpsUsed: 0,
		lifecycle: 'active',
		moving: false,
		runMode: false,
		targetingEnabled: true,
		velY: 0
	});
}

function guardInput(input, isLocked) {
	if (!input || input.__defeatGuarded) return;
	const axis = input.axis.bind(input);
	const consumeJump = input.consumeJump.bind(input);
	const runRequested = input.runRequested.bind(input);
	input.axis = () => isLocked() ? ZERO_AXIS : axis();
	input.consumeJump = () => {
		if (!isLocked()) return consumeJump();
		input.jumpRequested = false;
		return false;
	};
	input.runRequested = () => !isLocked() && runRequested();
	input.__defeatGuarded = true;
}

function guardCombat(combat, isLocked) {
	if (!combat || combat.__defeatGuarded) return;
	const activate = combat.activate.bind(combat);
	combat.activate = actionId => isLocked()
		? combat.reject('PLAYER_DEFEATED', { actionId })
		: activate(actionId);
	combat.__defeatGuarded = true;
}

function guardTargets(enemies, isLocked) {
	if (!enemies || enemies.__defeatGuarded) return;
	const cycleTarget = enemies.cycleTarget.bind(enemies);
	enemies.cycleTarget = () => !isLocked() && cycleTarget();
	enemies.__defeatGuarded = true;
}
