// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MeleeImpactRuntime.js
 * @description Resolves one timed melee impact through local or multiplayer authority.
 * The Awtsmoos joins geometry to consequence while every duplicate target stays denied;
 * Awtsmoos.com lets typed receipts return from either lawful authority side.
 */
import { resolveLocalEnemyCombatImpact } from './LocalEnemyCombatAuthority.js';
import { meleeHitGeometry } from './MeleeHitGeometry.js';

export function attemptMeleeImpact(combat, state) {
	const targetId = state.target.profile?.id || state.target.id;
	if (!targetId || state.hitIds.has(targetId)) return false;
	const geometry = meleeHitGeometry(
		state.action,
		playerPosition(combat),
		targetPosition(state.target)
	);
	if (!geometry.hit) return false;
	state.hitIds.add(targetId);
	const authority = combat.runtime.enemyAuthority;
	if (authority?.controls?.(state.target)) {
		resolveAuthority(combat, state, authority, geometry, targetId);
	} else {
		resolveLocal(combat, state, geometry, targetId);
	}
	combat.runtime.bus.emit('combat:melee-result', {
		...geometry,
		actionId: state.actionId,
		targetId
	});
	return true;
}

function resolveAuthority(combat, state, authority, geometry, targetId) {
	authority.attack(state.target, {
		actionId: state.actionId,
		elapsedSeconds: state.elapsed
	})
		.then(receipt => combat.runtime.bus.emit('combat:impact', {
			...geometry,
			...receipt,
			actionId: state.actionId,
			targetId
		}))
		.catch(error => combat.runtime.bus.emit('combat:rejected', {
			actionId: state.actionId,
			code: error?.code || error?.message,
			targetId
		}));
}

function resolveLocal(combat, state, geometry, targetId) {
	const receipt = resolveLocalEnemyCombatImpact({
		actionId: state.actionId,
		actor: state.target,
		localAction: state.action,
		runtime: combat.runtime
	});
	combat.runtime.bus.emit('combat:impact', {
		...geometry,
		...receipt,
		actionId: state.actionId,
		targetId
	});
}

function playerPosition(combat) {
	return {
		facing: combat.runtime.state.facing,
		x: combat.runtime.state.x,
		y: combat.runtime.state.renderY,
		z: combat.runtime.state.z
	};
}

function targetPosition(target) {
	return {
		x: target.group.position.x,
		y: target.group.position.y,
		z: target.group.position.z
	};
}
