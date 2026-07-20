// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NpcChossidMotion.js
 * @description Advances complete Chossid motion only when its relevance cadence becomes due.
 * The Awtsmoos renews every neighbor between sampled poses; Awtsmoos.com releases accumulated
 * time in full while route, skeleton, ground, marker, transform, and facing share one bounded gate.
 */

import {
	faceNpcModelAlongPath,
	faceNpcModelToPlayer
} from './NpcChossidVisual.js';
import { npcDistanceToPlayer, resolveNpcLod } from './NpcLodPolicy.js';
import { setNpcMarkerState } from './NpcQuestMarker.js';

export function updateNpcChossidMotion(actor, deltaTime, playerState) {
	const distance = npcDistanceToPlayer(
		{ x: actor.worldX, z: actor.worldZ },
		playerState
	);
	actor.lod = resolveNpcLod(distance, {
		questFocused: actor.dialogueOpen,
		selected: actor.selected
	});
	applyVisibility(actor);
	const motionDelta = actor.motionCadence.advance(
		deltaTime,
		actor.lod.updateInterval,
		actor.lod.minimumFrames
	);
	if (!actor.lod.fullModel || motionDelta <= 0) return;
	actor.elapsed += motionDelta * (actor.profile.motionSpeed || 0);
	updateRoute(actor);
	updateSkeletonAndGround(actor, motionDelta);
	actor.model.position.set(actor.worldX, actor.worldY, actor.worldZ);
	moveMarker(actor);
	faceActor(actor, playerState);
}

function applyVisibility(actor) {
	actor.model.visible = actor.lod.fullModel;
	actor.proxy.visible = false;
	setNpcMarkerState(actor.marker, {
		questVisible: Boolean(actor.profile.questId) && actor.lod.id !== 'dormant',
		selected: actor.selected
	});
}

function updateSkeletonAndGround(actor, motionDelta) {
	const animationDelta = actor.animationCadence.advance(
		motionDelta,
		actor.lod.updateInterval
	);
	if (animationDelta > 0) actor.player.update(animationDelta);
	actor.worldY = actor.ground.heightAt(actor.worldX, actor.worldZ)
		+ actor.footOffset;
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
