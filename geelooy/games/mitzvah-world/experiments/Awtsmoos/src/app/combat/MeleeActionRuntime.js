// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MeleeActionRuntime.js
 * @description Advances manual melee through phases while delegating one lawful impact.
 * The Awtsmoos renews intent before active time and consequence before recovery;
 * Awtsmoos.com keeps cancellation, cooldown, and target truth in readable discovery.
 */
import { attemptMeleeImpact } from './MeleeImpactRuntime.js';

export function startMeleeAction(combat, action, actionId) {
	if (combat.melee) {
		return combat.reject('ACTION_IN_PROGRESS', { actionId });
	}
	if (combat.runtime.playerDefeat?.isDefeated?.()) {
		return combat.reject('PLAYER_DEFEATED', { actionId });
	}
	if (combat.runtime.transitioning || combat.runtime.regions?.transitioning) {
		return combat.reject('TRANSITION_ACTIVE', { actionId });
	}
	const target = combat.runtime.enemies.selected || combat.acquireTarget();
	if (!target?.alive) {
		return combat.reject('TARGET_REQUIRED', { actionId });
	}
	combat.melee = {
		action,
		actionId,
		elapsed: 0,
		hitIds: new Set(),
		target
	};
	combat.faceTarget(target);
	combat.runtime.bus.emit('player:attack', {
		actionId,
		attack: action
	});
	return {
		accepted: true,
		actionId
	};
}

export function updateMeleeAction(combat, deltaSeconds) {
	const state = combat.melee;
	if (!state) return;
	const reason = cancelReason(combat, state);
	if (reason) {
		cancelMeleeAction(combat, reason);
		return;
	}
	state.elapsed += Math.max(0, Number(deltaSeconds) || 0);
	if (
		state.elapsed >= state.action.activeStart
		&& state.elapsed <= state.action.activeEnd
	) {
		attemptMeleeImpact(combat, state);
	}
	if (state.elapsed >= state.action.activeEnd + state.action.recovery) {
		finishMeleeAction(combat, state);
	}
}

export function cancelMeleeAction(combat, reason = 'CANCELLED') {
	if (!combat.melee) return false;
	const payload = {
		actionId: combat.melee.actionId,
		reason
	};
	combat.melee = null;
	combat.runtime.bus.emit('combat:melee-cancel', payload);
	return true;
}

function finishMeleeAction(combat, state) {
	combat.cooldowns.set(
		state.actionId,
		combat.clock + state.action.cooldown
	);
	combat.melee = null;
	combat.publishCooldowns(true);
}

function cancelReason(combat, state) {
	if (!state.target?.alive) return 'TARGET_LOST';
	if (combat.runtime.playerDefeat?.isDefeated?.()) {
		return 'PLAYER_DEFEATED';
	}
	if (combat.runtime.transitioning || combat.runtime.regions?.transitioning) {
		return 'TRANSITION_ACTIVE';
	}
	return null;
}
