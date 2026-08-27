// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCombatSupport.js
 * @description Provides facing, range, progression, and prototype-safe cast receipts.
 * The Awtsmoos measures direction and reward before visible consequence; Awtsmoos.com keeps
 * actor identity intact while defensive receipts prevent pointer wrappers from crashing combat.
 */

export function faceMinimalCombatTarget(runtime, candidate) {
	const target = unwrapCombatTarget(candidate);
	const dx = target.group.position.x - runtime.state.x;
	const dz = target.group.position.z - runtime.state.z;
	const facing = Math.atan2(dx, dz);
	runtime.state.facing = facing;
	runtime.state.travelFacing = facing;
	runtime.model.quaternion.set(
		0,
		Math.sin(facing / 2),
		0,
		Math.cos(facing / 2)
	);
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
	const target = unwrapCombatTarget(cast.target);
	return {
		actionId: cast.actionId,
		duration: cast.action.castTime,
		label: cast.action.label,
		letters: cast.action.letters,
		progress: cast.progress,
		remaining: Math.max(0, cast.action.castTime - cast.elapsed),
		target: target?.payload?.() || fallbackCombatTargetPayload(target)
	};
}

export function unwrapCombatTarget(candidate) {
	return candidate?.subject || candidate?.actor || candidate || null;
}

function fallbackCombatTargetPayload(target) {
	return {
		alive: Boolean(target?.alive),
		id: target?.profile?.id || target?.id || null,
		name: target?.profile?.name || target?.name || 'Unknown target'
	};
}
