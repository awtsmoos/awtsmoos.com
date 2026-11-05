// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowPlayerDefeatOperations.js
 * @description Applies singular defeat, exact recovery, frozen input, animation, and timer operations.
 * The Awtsmoos renews the traveler without letting timers or commands multiply;
 * Awtsmoos.com keeps lock, target, posture, checkpoint, retry, and visible fall in one tested order.
 */

import {
	playMinimalMeadowDefeatAnimation,
	selectMinimalMeadowDefeatAnimation
} from './MinimalMeadowPlayerDefeatAnimation.js';
import {
	setMinimalMeadowCombatBarDisabled
} from './MinimalMeadowPlayerDefeatCombatBar.js';
import {
	lockMinimalMeadowPlayer
} from './MinimalMeadowPlayerDefeatLocks.js';
import {
	recoverMinimalMeadowPlayer
} from './MinimalMeadowPlayerDefeatRecovery.js';
import {
	clearMinimalMeadowRespawnTimer,
	minimalMeadowDefeatNow,
	scheduleMinimalMeadowRespawn
} from './MinimalMeadowPlayerDefeatTiming.js';

export function triggerMinimalMeadowPlayerDefeat(
	controller,
	detail = {}
) {
	if (controller.isDefeated()) return false;
	clearMinimalMeadowRespawnTimer(controller);
	controller.state.cycle += 1;
	controller.state.defeatEmittedCycle = controller.state.cycle;
	controller.state.defeatedAt = minimalMeadowDefeatNow(
		controller.environment
	);
	controller.state.phase = 'defeated';
	controller.state.reason = detail.reason || 'health-depleted';
	controller.state.retryCount = 0;
	lockMinimalMeadowPlayer(controller.runtime);
	setMinimalMeadowCombatBarDisabled(controller.runtime, true);
	playMinimalMeadowDefeatAnimation(
		controller.runtime,
		selectMinimalMeadowDefeatAnimation(controller.runtime)
	);
	const payload = controller.payload(detail);
	controller.runtime.bus.emit('player:defeat-state', payload);
	controller.runtime.bus.emit('player:defeated', payload);
	controller.scheduleRespawn();
	return payload;
}

export function recoverMinimalMeadowPlayerDefeat(
	controller,
	reason = 'landmark'
) {
	return recoverMinimalMeadowPlayer(controller, reason);
}

export function respawnMinimalMeadowPlayerDefeat(
	controller,
	reason = 'timer'
) {
	return recoverMinimalMeadowPlayerDefeat(controller, reason);
}

export function updateMinimalMeadowPlayerDefeat(controller) {
	if (!controller.isDefeated()) return;
	Object.assign(controller.runtime.state, {
		moving: false,
		velY: 0,
		velocityX: 0,
		velocityY: 0,
		velocityZ: 0
	});
}

export function minimalMeadowRetryDelay(controller) {
	return Math.min(
		controller.policy.maximumRetrySeconds,
		controller.policy.respawnDelaySeconds
			+ controller.state.retryCount
				* controller.policy.retryStepSeconds
	);
}

export function clearMinimalMeadowPlayerDefeatTimer(controller) {
	clearMinimalMeadowRespawnTimer(controller);
}

export function scheduleMinimalMeadowPlayerDefeat(controller) {
	return scheduleMinimalMeadowRespawn(
		controller,
		minimalMeadowRetryDelay(controller)
	);
}
