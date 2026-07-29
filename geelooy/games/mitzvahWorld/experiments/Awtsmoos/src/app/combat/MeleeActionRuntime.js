// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MeleeActionRuntime.js
 * @description Advances manual melee through real phases and one authoritative hit ledger.
 * The Awtsmoos renews each instant without confusing intent for impact; Awtsmoos.com
 * waits for geometry and active time before local or multiplayer consequence may appear.
 */
import { meleeHitGeometry } from './MeleeHitGeometry.js';

export function startMeleeAction(combat, action, actionId) {
	if (combat.melee) return combat.reject('ACTION_IN_PROGRESS', { actionId });
	if (combat.runtime.playerDefeat?.isDefeated?.()) return combat.reject('PLAYER_DEFEATED', { actionId });
	if (combat.runtime.transitioning || combat.runtime.regions?.transitioning) return combat.reject('TRANSITION_ACTIVE', { actionId });
	const target = combat.runtime.enemies.selected || combat.acquireTarget();
	if (!target?.alive) return combat.reject('TARGET_REQUIRED', { actionId });
	combat.melee = { action, actionId, elapsed: 0, hitIds: new Set(), target };
	combat.faceTarget(target);
	combat.runtime.bus.emit('player:attack', { actionId, attack: action });
	return { accepted: true, actionId };
}

export function updateMeleeAction(combat, deltaSeconds) {
	const state = combat.melee;
	if (!state) return;
	const reason = cancelReason(combat, state);
	if (reason) return void cancelMeleeAction(combat, reason);
	state.elapsed += Math.max(0, Number(deltaSeconds) || 0);
	if (state.elapsed >= state.action.activeStart && state.elapsed <= state.action.activeEnd) attemptMeleeImpact(combat, state);
	if (state.elapsed >= state.action.activeEnd + state.action.recovery) finishMeleeAction(combat, state);
}

export function cancelMeleeAction(combat, reason = 'CANCELLED') {
	if (!combat.melee) return false;
	const payload = { actionId: combat.melee.actionId, reason };
	combat.melee = null;
	combat.runtime.bus.emit('combat:melee-cancel', payload);
	return true;
}

function attemptMeleeImpact(combat, state) {
	const targetId = state.target.profile?.id || state.target.id;
	if (!targetId || state.hitIds.has(targetId)) return false;
	const result = meleeHitGeometry(state.action, playerPosition(combat), targetPosition(state.target));
	if (!result.hit) return false;
	state.hitIds.add(targetId);
	const authority = combat.runtime.enemyAuthority;
	if (authority?.controls?.(state.target)) resolveAuthority(combat, state, authority, result, targetId);
	else state.target.applyDamage?.(localDamage(combat, state.action));
	combat.runtime.bus.emit('combat:melee-result', { ...result, actionId: state.actionId, targetId });
	return true;
}

function resolveAuthority(combat, state, authority, geometry, targetId) {
	authority.attack(state.target, { actionId: state.actionId, elapsedSeconds: state.elapsed })
		.then(receipt => combat.runtime.bus.emit('combat:impact', { ...geometry, ...receipt, actionId: state.actionId, targetId }))
		.catch(error => combat.runtime.bus.emit('combat:rejected', { actionId: state.actionId, code: error?.code || error?.message, targetId }));
}

function finishMeleeAction(combat, state) {
	combat.cooldowns.set(state.actionId, combat.clock + state.action.cooldown);
	combat.melee = null;
	combat.publishCooldowns(true);
}
function cancelReason(combat, state) {
	if (!state.target?.alive) return 'TARGET_LOST';
	if (combat.runtime.playerDefeat?.isDefeated?.()) return 'PLAYER_DEFEATED';
	if (combat.runtime.transitioning || combat.runtime.regions?.transitioning) return 'TRANSITION_ACTIVE';
	return null;
}
function localDamage(combat, action) {
	const base = combat.runtime.derivedStats?.snapshot?.().values?.baseDamage || 12;
	return Math.max(1, Math.round(base * action.baseDamageMultiplier));
}
function playerPosition(combat) { return { facing: combat.runtime.state.facing, x: combat.runtime.state.x, y: combat.runtime.state.renderY, z: combat.runtime.state.z }; }
function targetPosition(target) { return { x: target.group.position.x, y: target.group.position.y, z: target.group.position.z }; }
