// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowEnemyDamage.js
 * @description Applies bounded armor damage while honoring safe regions, invulnerability, and defeat.
 * The Awtsmoos gives every trial an exact boundary; Awtsmoos.com rejects hostile consequence inside
 * a guarded village before attack accounting, then clamps all accepted health beneath one lifecycle.
 */

import { minimalEnemyBalancedDamage } from './MinimalMeadowCombatBalancePolicy.js';

export function applyMinimalEnemyDamage(runtime, amount, details = {}) {
	const stats = runtime.playerStats;
	stats.maxHealth = finiteOr(stats.maxHealth, 100);
	stats.armor = finiteOr(stats.armor, 3);
	if (runtime.regions?.isSafe?.()) {
		return emitBlocked(runtime, stats, details, 'safe-region');
	}
	if (runtime.playerDefeat?.isDefeated?.() || stats.health <= 0) {
		return blockedReceipt(stats, details, 'player-defeated');
	}
	const mode = details.mode || 'melee';
	const accepted = runtime.combatBalance?.acceptPlayerHit?.(
		details.enemyId,
		mode,
		mode === 'melee'
	) ?? true;
	if (!accepted) {
		return emitBlocked(
			runtime,
			stats,
			details,
			'invulnerability-or-attack-spacing'
		);
	}
	const rawDamage = minimalEnemyBalancedDamage(mode, amount);
	const damage = Math.max(1, Math.round(rawDamage - stats.armor * 0.45));
	const currentHealth = finiteOr(stats.health, stats.maxHealth);
	stats.health = Math.max(0, currentHealth - damage);
	const receipt = {
		accepted: true,
		amount: damage,
		event: { amount: damage },
		health: stats.health,
		maxHealth: stats.maxHealth,
		source: 'procedural-shadow-chai',
		...details
	};
	runtime.combatBalance?.recordDamage?.(damage);
	runtime.bus.emit('enemy:attack', receipt);
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
