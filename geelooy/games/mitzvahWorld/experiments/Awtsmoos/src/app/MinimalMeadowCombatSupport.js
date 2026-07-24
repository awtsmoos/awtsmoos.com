// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCombatSupport.js
 * @description Provides facing, range, progression, and cast receipts for charged combat.
 * The Awtsmoos measures direction and reward before visible consequence; Awtsmoos.com keeps
 * state arithmetic separate from activation, charging, projectile, collision, and UI events.
 */

export function faceMinimalCombatTarget(runtime, target) {
	const dx = target.group.position.x - runtime.state.x;
	const dz = target.group.position.z - runtime.state.z;
	const facing = Math.atan2(dx, dz);
	runtime.state.facing = facing;
	runtime.state.travelFacing = facing;
	runtime.model.quaternion.set(0, Math.sin(facing / 2), 0, Math.cos(facing / 2));
	return facing;
}

export function rewardMinimalCombatPlayer(runtime, amount) {
	const stats = runtime.playerStats;
	stats.xp += amount;
	while (stats.xp >= stats.xpMax) {
		stats.xp -= stats.xpMax;
		stats.level += 1;
		stats.xpMax = Math.round(stats.xpMax * 1.35);
	}
	const receipt = { amount, ...stats };
	runtime.bus.emit('player:xp', receipt);
	return receipt;
}

export function minimalCombatDistance(first, second) {
	return Math.hypot(first.x - second.x, first.z - second.z);
}

export function minimalCombatCastPayload(cast) {
	if (!cast) return {};
	return {
		actionId: cast.actionId,
		duration: cast.action.castTime,
		label: cast.action.label,
		letters: cast.action.letters,
		progress: cast.progress,
		remaining: Math.max(0, cast.action.castTime - cast.elapsed),
		target: cast.target.payload()
	};
}
