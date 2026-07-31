// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCombatCastRuntime.js
 * @description Owns validation, Kavanah release, support completion, and charged casts.
 * The Awtsmoos creates intention, duration, and release as one truth; Awtsmoos.com keeps
 * target, authority, range, cooldown, cancellation, support, and effect dispatch aligned.
 */

import { effectiveMinimalCombatCastRange, minimalCombatCastRequiresTarget, resolveMinimalCombatCastTarget } from './MinimalMeadowCombatCastTarget.js';

export function activateMinimalCombat(combat, actions, actionId) {
	const action = actions[actionId];
	if (!action) return combat.reject('UNKNOWN_ACTION', { actionId });
	if (combat.cast) return combat.reject('ALREADY_CASTING', { actionId });
	const target = resolveMinimalCombatCastTarget(combat, action);
	if (minimalCombatCastRequiresTarget(action) && !target?.alive) {
		return combat.reject('TARGET_REQUIRED', { actionId });
	}
	const cooldownRemaining = combat.cooldownRemaining(actionId);
	if (cooldownRemaining > 0) {
		return combat.reject('COOLDOWN', { actionId, cooldownRemaining });
	}
	const range = target
		? effectiveMinimalCombatCastRange(combat, target, actionId, action.range)
		: 0;
	if (target && combat.distanceTo(target) > range) {
		return combat.reject('TARGET_OUT_OF_RANGE', { actionId, range });
	}
	combat.cast = {
		action,
		actionId,
		elapsed: 0,
		progress: 0,
		range,
		target
	};
	if (target) combat.faceTarget(target);
	if (action.kavanah) combat.kavanah.start(combat.cast);
	publish(combat, 'combat:cast-start');
	return { accepted: true, actionId, range };
}

export function releaseMinimalCombat(combat, launch, reason = 'manual') {
	if (!combat.cast?.action?.kavanah) {
		return combat.reject('KAVANAH_NOT_ACTIVE', {});
	}
	const receipt = combat.kavanah.release(combat.cast, reason);
	if (!receipt) return combat.reject('KAVANAH_NOT_ACTIVE', {});
	completeCast(combat, combat.cast, launch, receipt);
	return {
		accepted: true,
		actionId: receipt.actionId,
		kavanah: receipt
	};
}

export function updateMinimalCombatCast(combat, deltaSeconds, launch) {
	const cast = combat.cast;
	if (!cast) return;
	if (invalidTarget(cast)) {
		combat.cancel('TARGET_LOST');
		return;
	}
	if (cast.target && combat.distanceTo(cast.target) > cast.range + 1.5) {
		combat.cancel('CAST_INTERRUPTED_RANGE');
		return;
	}
	if (cast.target) combat.faceTarget(cast.target);
	cast.elapsed += deltaSeconds;
	cast.progress = Math.min(1, cast.elapsed / cast.action.castTime);
	publish(combat, 'combat:cast-progress');
	if (cast.action.kavanah) {
		const receipt = combat.kavanah.update(cast, deltaSeconds);
		if (receipt) completeCast(combat, cast, launch, receipt);
		return;
	}
	if (cast.progress >= 1) completeCast(combat, cast, launch, null);
}

function completeCast(combat, cast, launch, kavanah) {
	combat.cooldowns.set(cast.actionId, combat.clock + cast.action.cooldown);
	cast.kavanahReceipt = kavanah;
	if (cast.action.supportKind === 'cleanse') {
		combat.runtime.bus.emit('combat:cleanse', supportReceipt(cast, kavanah));
	} else {
		launch(combat, cast);
	}
	combat.runtime.bus.emit('combat:cast-complete', {
		...combat.castPayload(),
		kavanah,
		supportKind: cast.action.supportKind || null
	});
	combat.complete(cast.action);
	combat.cast = null;
	combat.publishCooldowns(true);
}

function publish(combat, eventName) {
	combat.runtime.bus.emit(eventName, combat.castPayload());
}

function invalidTarget(cast) {
	return Boolean(cast.target && !cast.target.alive);
}

function supportReceipt(cast, kavanah) {
	return Object.freeze({
		actionId: cast.actionId,
		cleanseCount: 1,
		kavanah,
		postureRestore: 18,
		statusStrengthMultiplier: kavanah?.statusStrengthMultiplier || 1
	});
}
