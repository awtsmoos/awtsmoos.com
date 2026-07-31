// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowPlayerDefeatRecovery.js
 * @description Restores resources, checkpoint, animation, controls, camera, and authority exactly once.
 * The Awtsmoos renews the fallen vessel without multiplying authorities; Awtsmoos.com
 * requests deployed truth when present and otherwise returns through one explicit local checkpoint.
 */

import {
	clearMinimalMeadowDefeatAnimation
} from './MinimalMeadowPlayerDefeatAnimation.js';
import {
	setMinimalMeadowCombatBarDisabled
} from './MinimalMeadowPlayerDefeatCombatBar.js';
import {
	restoreMinimalMeadowDefeatCheckpoint
} from './MinimalMeadowPlayerDefeatCheckpoint.js';
import {
	restoreMinimalMeadowPlayer
} from './MinimalMeadowPlayerDefeatLocks.js';

export function recoverMinimalMeadowPlayer(controller, reason) {
	const cycle = controller.state.cycle;
	if (!controller.isDefeated()
		|| controller.state.respawnedCycle === cycle) {
		return false;
	}
	const previousRespawnedCycle = controller.state.respawnedCycle;
	controller.clearTimer();
	controller.state.respawnedCycle = cycle;
	controller.state.phase = 'recovering';
	controller.runtime.bus.emit(
		'combat:cancel-all',
		{ reason: 'PLAYER_DEFEATED' }
	);
	controller.runtime.bus.emit(
		'player:recovery',
		controller.payload({ reason })
	);
	const request = authoritativeRespawn(controller.runtime);
	if (!request) return finalizeRecovery(controller, reason);
	return request
		.then(() => finalizeRecovery(controller, reason))
		.catch(error => failRecovery(
			controller,
			error,
			previousRespawnedCycle
		));
}

function authoritativeRespawn(runtime) {
	if (!runtime.enemyAuthority) return null;
	const method = runtime.multiplayerBridge?.client?.mmorpg?.respawn;
	if (typeof method !== 'function') return null;
	return Promise.resolve(
		method.call(runtime.multiplayerBridge.client.mmorpg)
	);
}

function finalizeRecovery(controller, reason) {
	const runtime = controller.runtime;
	const checkpoint = restoreMinimalMeadowDefeatCheckpoint(
		runtime,
		controller.state.checkpoint
	);
	runtime.playerStats.health = runtime.playerStats.maxHealth;
	if (Number.isFinite(runtime.playerStats.maxStamina)) {
		runtime.playerStats.stamina = runtime.playerStats.maxStamina;
	}
	runtime.combatBalance?.resetForRespawn?.();
	restoreMinimalMeadowPlayer(runtime);
	setMinimalMeadowCombatBarDisabled(runtime, false);
	clearMinimalMeadowDefeatAnimation(runtime);
	if (!runtime.enemyAuthority) runtime.enemies?.clearAll?.();
	controller.state.phase = 'active';
	controller.state.reason = null;
	runtime.bus.emit('profile:state', { ...runtime.playerStats });
	runtime.bus.emit(
		'player:respawned',
		controller.payload({ checkpoint, reason })
	);
	return true;
}

function failRecovery(controller, error, previousRespawnedCycle) {
	controller.state.respawnedCycle = previousRespawnedCycle;
	controller.state.phase = 'defeated';
	controller.runtime.bus.emit('recovery:feedback', {
		action: 'player-respawn',
		message: 'Authoritative respawn failed; the safe checkpoint remains preserved.',
		reason: error?.message || 'RESPAWN_FAILED',
		success: false
	});
	controller.scheduleRespawn();
	return false;
}
