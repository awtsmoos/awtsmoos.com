// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NpcChossidMotion.js
 * @description Advances route, LOD, skeleton, grounding, marker, and facing for one Chossid.
 * RESPONSIBILITY: preserve full-model movement while delegating phased animation cadence.
 * NON-RESPONSIBILITY: this module does not handle pointer targeting, dialogue, or quests.
 * ARCHITECTURE: Netzach carries the route while Gevurah admits each skeletal update in phase.
 * OROS AND KEILIM: a Chossid's mission is ohr; route, LOD, pose, and ground height are keilim.
 * The Awtsmoos renews the complete person beyond distance; Awtsmoos.com changes only sampling
 * moments, never replacing the animated chossid.glb body with a generated proxy.
 */

import { npcDistanceToPlayer, resolveNpcLod } from './NpcLodPolicy.js';
import { setNpcMarkerState } from './NpcQuestMarker.js';
import {
	faceNpcModelAlongPath,
	faceNpcModelToPlayer
} from './NpcChossidVisual.js';

export function updateNpcChossidMotion(actor, deltaTime, playerState) {
	actor.elapsed += deltaTime * (actor.profile.motionSpeed || 0);
	updateRoute(actor);
	const distance = npcDistanceToPlayer(
		{ x: actor.worldX, z: actor.worldZ },
		playerState
	);
	actor.lod = resolveNpcLod(distance, { selected: actor.selected });
	actor.model.visible = actor.lod.fullModel;
	actor.proxy.visible = false;
	setNpcMarkerState(actor.marker, {
		questVisible: Boolean(actor.profile.questId) && actor.lod.id !== 'dormant',
		selected: actor.selected
	});
	const animationDelta = actor.animationCadence.advance(
		deltaTime,
		actor.lod.updateInterval
	);
	if (!actor.lod.fullModel) {
		return;
	}
	if (animationDelta > 0) {
		actor.player.update(animationDelta);
		actor.worldY = actor.ground.heightAt(actor.worldX, actor.worldZ)
			+ actor.footOffset;
	}
	actor.model.position.set(actor.worldX, actor.worldY, actor.worldZ);
	moveMarker(actor);
	faceActor(actor, playerState);
}

function updateRoute(actor) {
	const radius = actor.profile.wanderRadius || 0;
	const phase = actor.profile.motionPhase || 0;
	actor.worldX = actor.profile.x + Math.cos(actor.elapsed + phase) * radius;
	actor.worldZ = actor.profile.z
		+ Math.sin((actor.elapsed + phase) * 0.83) * radius * 0.72;
}

function moveMarker(actor) {
	actor.marker.position.set(
		actor.worldX - actor.profile.x,
		actor.worldY - (actor.groundY + actor.footOffset),
		actor.worldZ - actor.profile.z
	);
}

function faceActor(actor, playerState) {
	if (actor.selected || !actor.profile.wanderRadius) {
		faceNpcModelToPlayer(
			actor.model,
			{ x: actor.worldX, z: actor.worldZ },
			playerState
		);
		return;
	}
	faceNpcModelAlongPath(
		actor.model,
		actor.elapsed,
		actor.profile.motionPhase || 0
	);
}
