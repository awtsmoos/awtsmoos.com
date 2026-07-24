// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowPlayerDefeatRecovery.js
 * @description Restores checkpoint, health, collision, animation, camera, and targeting exactly once.
 * The Awtsmoos renews the fallen vessel without multiplying authorities; Awtsmoos.com lets
 * the controller decide when while this focused recovery vessel decides how play returns.
 */

import { clearMinimalMeadowDefeatAnimation } from './MinimalMeadowPlayerDefeatAnimation.js';
import { restoreMinimalMeadowPlayer } from './MinimalMeadowPlayerDefeatLocks.js';

export function recoverMinimalMeadowPlayer(controller, reason) {
	const cycle = controller.state.cycle;
	if (!controller.isDefeated() || controller.state.respawnedCycle === cycle) return false;
	controller.clearTimer();
	controller.state.respawnedCycle = cycle;
	controller.state.phase = 'recovering';
	controller.runtime.bus.emit('player:recovery', controller.payload({ reason }));
	restoreCheckpoint(controller.runtime, controller.state.checkpoint);
	controller.runtime.playerStats.health = controller.runtime.playerStats.maxHealth;
	controller.runtime.combatBalance?.resetForRespawn?.();
	restoreMinimalMeadowPlayer(controller.runtime);
	clearMinimalMeadowDefeatAnimation(controller.runtime);
	controller.state.phase = 'active';
	controller.runtime.bus.emit('profile:state', { ...controller.runtime.playerStats });
	controller.runtime.bus.emit('player:respawned', controller.payload({ reason }));
	return true;
}

function restoreCheckpoint(runtime, checkpoint) {
	Object.assign(runtime.state, {
		facing: checkpoint.facing,
		groundY: checkpoint.y,
		renderY: checkpoint.y,
		travelFacing: checkpoint.facing,
		x: checkpoint.x,
		y: checkpoint.y,
		z: checkpoint.z
	});
	runtime.model?.position?.set?.(checkpoint.x, checkpoint.y, checkpoint.z);
	runtime.enemies?.clearAll?.();
	runtime.cameraRig?.update?.(runtime.camera, runtime.state, runtime.mainOctree, 0);
}
