// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NpcChossidMotion.js
 * @description Advances road-bound schedules while preserving relevance and animation cadence.
 * The Awtsmoos renews one neighbor through distance, duty, and return; Awtsmoos.com keeps
 * logical life continuous while bones, ground samples, and visible vessels obey the frame budget.
 */

import { npcDistanceToPlayer, resolveNpcLod } from './NpcLodPolicy.js';
import { setNpcMarkerState } from './NpcQuestMarker.js';
import { faceNpcScheduledActor } from './NpcScheduleFacing.js';
import { applyNpcScheduleJourney } from './NpcScheduleJourney.js';

const DUTY_WANDER_SCALE = Object.freeze({
	'join-village-gathering': 0.68,
	'pray-shacharis': 0.32,
	'rest-at-home': 0.16
});

export function updateNpcChossidMotion(actor, deltaTime, playerState, worldHour) {
	applyNpcScheduleJourney(actor, worldHour);
	updateLogicalRoute(actor);
	const previousLodId = actor.lod?.id;
	actor.lod = resolveNpcLod(
		npcDistanceToPlayer({ x: actor.worldX, z: actor.worldZ }, playerState),
		{ questFocused: actor.dialogueOpen, selected: actor.selected }
	);
	applyVisibility(actor);
	const motionDelta = actor.motionCadence.advance(
		deltaTime,
		actor.lod.updateInterval,
		actor.lod.minimumFrames
	);
	if (!actor.lod.fullModel && !actor.lod.proxyModel) return;
	const becameVisible = previousLodId === 'dormant' && actor.lod.id !== 'dormant';
	const appliedDelta = motionDelta > 0
		? motionDelta
		: becameVisible ? Math.max(deltaTime, 1 / 60) : 0;
	if (appliedDelta <= 0) return;
	actor.elapsed += appliedDelta * (actor.profile.motionSpeed || 0);
	updateLogicalRoute(actor);
	updateGround(actor);
	moveMarker(actor);
	if (actor.lod.fullModel) updateFullModel(actor, appliedDelta, playerState);
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

function updateLogicalRoute(actor) {
	const radius = localWanderRadius(actor);
	const phase = actor.profile.motionPhase || 0;
	actor.worldX = actor.routeCenterX + Math.cos(actor.elapsed + phase) * radius;
	actor.worldZ = actor.routeCenterZ
		+ Math.sin((actor.elapsed + phase) * 0.83) * radius * 0.72;
}

function localWanderRadius(actor) {
	if (actor.isTravelling) return 0;
	const scale = DUTY_WANDER_SCALE[actor.activeScheduleAction] ?? 0.52;
	return (actor.profile.wanderRadius || 0) * scale;
}

function updateFullModel(actor, motionDelta, playerState) {
	const animationDelta = actor.animationCadence.advance(
		motionDelta,
		actor.lod.updateInterval
	);
	if (animationDelta > 0) actor.player.update(animationDelta);
	actor.model.position.set(actor.worldX, actor.worldY, actor.worldZ);
	faceNpcScheduledActor(actor.model, actor, playerState);
}

function updateProxy(actor) {
	actor.proxy.position.set(
		actor.worldX,
		actor.worldY - actor.footOffset,
		actor.worldZ
	);
	faceNpcScheduledActor(actor.proxy, actor, null);
}

function updateGround(actor) {
	actor.worldY = actor.ground.heightAt(actor.worldX, actor.worldZ)
		+ actor.footOffset;
}

function moveMarker(actor) {
	actor.marker.position.set(
		actor.worldX - actor.profile.x,
		actor.worldY - (actor.groundY + actor.footOffset),
		actor.worldZ - actor.profile.z
	);
}
