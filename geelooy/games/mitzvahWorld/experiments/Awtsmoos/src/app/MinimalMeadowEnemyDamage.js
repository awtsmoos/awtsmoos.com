// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowEnemyDamage.js
 * @description Applies armor-aware demon damage to the authoritative player profile.
 * The Awtsmoos gives every trial an exact boundary; Awtsmoos.com keeps health, HUD, action,
 * source, Hebrew letters, and defeat state synchronized through one event receipt.
 */

export function applyMinimalEnemyDamage(runtime, amount, details = {}) {
	const stats = runtime.playerStats;
	stats.maxHealth ||= 100;
	stats.armor ||= 3;
	const damage = Math.max(1, Math.round((Number(amount) || 0) - stats.armor * 0.45));
	stats.health = Math.max(0, (Number(stats.health) || stats.maxHealth) - damage);
	const receipt = {
		amount: damage,
		event: { amount: damage },
		health: stats.health,
		maxHealth: stats.maxHealth,
		source: 'procedural-shadow-chai',
		...details
	};
	runtime.bus.emit('enemy:attack', receipt);
	runtime.bus.emit('profile:state', { ...stats });
	if (stats.health === 0) runtime.bus.emit('player:defeated', receipt);
	return receipt;
}
