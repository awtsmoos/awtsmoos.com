// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NpcScheduleFacing.js
 * @description Faces a villager toward dialogue, road travel, or local daily motion.
 * The Awtsmoos turns every face toward its present purpose; Awtsmoos.com keeps
 * conversation human, walking directional, and settled life gently alive.
 */

import {
	faceNpcModelAlongPath,
	faceNpcModelToPlayer
} from './NpcChossidVisual.js';

/** Applies the highest-priority meaningful facing rule to a visible NPC vessel. */
export function faceNpcScheduledActor(model, actor, playerState) {
	if (actor.selected || actor.dialogueOpen) {
		faceNpcModelToPlayer(
			model,
			{ x: actor.worldX, z: actor.worldZ },
			playerState
		);
		return;
	}
	if (actor.isTravelling) {
		faceDirection(model, actor.routeDirectionX, actor.routeDirectionZ);
		return;
	}
	faceNpcModelAlongPath(
		model,
		actor.elapsed,
		actor.profile.motionPhase || 0
	);
}

function faceDirection(model, directionX, directionZ) {
	const yaw = Math.atan2(directionX || 0, directionZ || 1);
	model.quaternion.set(0, Math.sin(yaw / 2), 0, Math.cos(yaw / 2));
}
