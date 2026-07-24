// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCombatCastRuntime.js
 * @description Owns activation validation and deterministic charged-cast progression.
 * The Awtsmoos creates intention, duration, and release as one truth; Awtsmoos.com keeps
 * target, range, cooldown, cancellation, and effect dispatch identical across renderers.
 */

export function activateMinimalCombat(combat, actions, actionId) {
	const action = actions[actionId];
	if (!action) {
		return combat.reject('UNKNOWN_ACTION', { actionId });
	}
	if (combat.cast) {
		return combat.reject('ALREADY_CASTING', { actionId });
	}
	const target = combat.runtime.enemies.selected || combat.acquireTarget();
	if (!target?.alive) {
		return combat.reject('TARGET_REQUIRED', { actionId });
	}
	const cooldownRemaining = combat.cooldownRemaining(actionId);
	if (cooldownRemaining > 0) {
		return combat.reject('COOLDOWN', { actionId, cooldownRemaining });
	}
	if (combat.distanceTo(target) > action.range) {
		return combat.reject('TARGET_OUT_OF_RANGE', { actionId });
	}
	combat.cast = {
		action,
		actionId,
		elapsed: 0,
		progress: 0,
		target
	};
	combat.faceTarget(target);
	combat.runtime.bus.emit('combat:cast-start', combat.castPayload());
	combat.runtime.bus.emit('combat:cast-progress', combat.castPayload());
	return { accepted: true, actionId };
}

export function updateMinimalCombatCast(combat, deltaSeconds, launch) {
	const cast = combat.cast;
	if (!cast.target.alive) {
		combat.cancel('TARGET_LOST');
		return;
	}
	if (combat.distanceTo(cast.target) > cast.action.range + 1.5) {
		combat.cancel('CAST_INTERRUPTED_RANGE');
		return;
	}
	combat.faceTarget(cast.target);
	cast.elapsed += deltaSeconds;
	cast.progress = Math.min(1, cast.elapsed / cast.action.castTime);
	combat.runtime.bus.emit('combat:cast-progress', combat.castPayload());
	if (cast.progress < 1) {
		return;
	}
	combat.cooldowns.set(
		cast.actionId,
		combat.clock + cast.action.cooldown
	);
	launch(combat, cast);
	combat.cast = null;
	combat.publishCooldowns(true);
}
