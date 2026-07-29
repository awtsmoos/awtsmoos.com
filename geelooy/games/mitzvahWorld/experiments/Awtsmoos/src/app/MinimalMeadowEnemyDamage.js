// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowEnemyDamage.js
 * @description Applies safe-region, spacing, defense, resistance, health, and defeat truth.
 * The Awtsmoos gives every trial an exact boundary; Awtsmoos.com lets readable attacks
 * meet guard, parry, ward, armor, and recovery before one bounded consequence is accepted.
 */
import { createCombatDamageEvent } from '../gameplay/CombatDamageEvent.js';
import { minimalEnemyBalancedDamage } from './MinimalMeadowCombatBalancePolicy.js';

export function applyMinimalEnemyDamage(runtime, amount, details = {}) {
	const stats = runtime.playerStats;
	stats.maxHealth = finiteOr(stats.maxHealth, 100);
	stats.armor = finiteOr(stats.armor, 3);
	if (runtime.regions?.isSafe?.()) return emitBlocked(runtime, stats, details, 'safe-region');
	if (runtime.playerDefeat?.isDefeated?.() || stats.health <= 0) {
		return blockedReceipt(stats, details, 'player-defeated');
	}
	const mode = details.mode || 'melee';
	const accepted = runtime.combatBalance?.acceptPlayerHit?.(
		details.enemyId,
		mode,
		mode === 'melee'
	) ?? true;
	if (!accepted) return emitBlocked(runtime, stats, details, 'invulnerability-or-attack-spacing');
	const rawDamage = minimalEnemyBalancedDamage(mode, amount);
	const proposed = createCombatDamageEvent({
		amount: Math.max(1, rawDamage - stats.armor * 0.45),
		damageType: details.damageType || mode,
		hitDirection: details.hitDirection,
		sourceId: details.enemyId || 'procedural-shadow-chai',
		staggerAmount: details.staggerAmount || 0,
		targetId: 'local-player',
		worldPosition: details.worldPosition
	}, runtime.combat?.clock || 0);
	const event = runtime.playerDefense?.resolveIncoming(proposed, runtime.combat?.clock || 0) || proposed;
	const damage = Math.max(0, Math.round(event.amount));
	stats.health = Math.max(0, finiteOr(stats.health, stats.maxHealth) - damage);
	const receipt = {
		accepted: damage > 0,
		amount: damage,
		blocked: event.blocked ? event.mitigationSource : null,
		event,
		health: stats.health,
		maxHealth: stats.maxHealth,
		source: 'procedural-shadow-chai',
		...details
	};
	runtime.combatBalance?.recordDamage?.(damage);
	runtime.bus.emit(event.blocked ? 'player:damage-blocked' : 'enemy:attack', receipt);
	runtime.bus.emit('combat:defense-state', runtime.playerDefense?.snapshot(runtime.combat?.clock || 0));
	runtime.bus.emit('profile:state', { ...stats });
	if (stats.health === 0) runtime.playerDefeat?.defeat?.(receipt);
	return receipt;
}

function emitBlocked(runtime, stats, details, reason) {
	const receipt = blockedReceipt(stats, details, reason);
	runtime.bus.emit('player:damage-blocked', receipt);
	return receipt;
}
function blockedReceipt(stats, details, reason) {
	return {
		accepted: false,
		amount: 0,
		blocked: reason,
		event: { amount: 0 },
		health: Math.max(0, finiteOr(stats.health, 0)),
		maxHealth: stats.maxHealth,
		source: 'procedural-shadow-chai',
		...details
	};
}
function finiteOr(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) ? number : fallback;
}
