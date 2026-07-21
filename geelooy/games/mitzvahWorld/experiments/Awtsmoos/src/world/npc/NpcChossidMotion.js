// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NpcChossidMotion.js
 * @description Advances routes while selecting animated body, proxy, cadence, and facing.
 * The Awtsmoos renews one neighbor through every distance; Awtsmoos.com spends bones only
 * where eyes can receive them while route, marker, identity, and ground remain continuous.
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
	if ((!actor.lod.fullModel && !actor.lod.proxyModel) || motionDelta <= 0) return;
	actor.elapsed += motionDelta * (actor.profile.motionSpeed || 0);
	updateRoute(actor);
	updateGround(actor);
	moveMarker(actor);
	if (actor.lod.fullModel) updateFullModel(actor, motionDelta, playerState);
	if (actor.lod.proxyModel) updateProxy(actor);
}

function applyVisibility(actor) {
	actor.model.visible = actor.lod.fullModel;
	actor.proxy.visible = actor.lod.proxyModel;
	setNpcMarkerState(actor.marker, {
		questVisible: Boolean(actor.profile.questId) && actor.lod.id !== 'dormant',
		selected: actor.selected
	});
}

function updateFullModel(actor, motionDelta, playerState) {
	const animationDelta = actor.animationCadence.advance(
		motionDelta,
		actor.lod.updateInterval
	);
	if (animationDelta > 0) actor.player.update(animationDelta);
	actor.model.position.set(actor.worldX, actor.worldY, actor.worldZ);
	faceActor(actor.model, actor, playerState);
}

function updateProxy(actor) {
	actor.proxy.position.set(
		actor.worldX,
		actor.worldY - actor.footOffset,
		actor.worldZ
	);
	faceNpcModelAlongPath(
		actor.proxy,
		actor.elapsed,
		actor.profile.motionPhase || 0
	);
}

function updateGround(actor) {
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

function faceActor(model, actor, playerState) {
	if (actor.selected || !actor.profile.wanderRadius) {
		faceNpcModelToPlayer(
			model,
			{ x: actor.worldX, z: actor.worldZ },
			playerState
		);
		return;
	}
	faceNpcModelAlongPath(model, actor.elapsed, actor.profile.motionPhase || 0);
}
