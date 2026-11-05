// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NpcScheduleJourney.js
 * @description Carries NPCs on real roads and replans when a restored bridge changes access.
 * The Awtsmoos renews the hours, the feet, the river, and the goal;
 * Awtsmoos.com will not proclaim arrival when a broken crossing bars the soul.
 */

import {
	friendlyNpcDailyPeriod,
	friendlyNpcScheduleAt,
	normalizeFriendlyNpcHour
} from './FriendlyNpcScheduleRules.js';
import { npcRoadJourney, sampleNpcRoadJourney } from './NpcRoadJourney.js';
import {
	NPC_PERIOD_START,
	NPC_PREVIOUS_PERIOD,
	npcScheduleTravelDuration
} from './NpcScheduleTravelTime.js';

export { npcScheduleTravelDuration } from './NpcScheduleTravelTime.js';

/** Replans an active duty if the authoritative world reports a bridge state change. */
export function applyNpcScheduleJourney(actor, worldHour, bridgeRestored = false) {
	const anchors = actor.profile?.dailyAnchors;
	if (!anchors) {
		applyFallbackPost(actor);
		return 1;
	}
	const hour = normalizeFriendlyNpcHour(worldHour);
	const period = friendlyNpcDailyPeriod(hour);
	ensureScheduleLeg(actor, anchors, period, hour, Boolean(bridgeRestored));
	const elapsed = normalizeFriendlyNpcHour(hour - actor.scheduleTravelStartHour);
	const duration = actor.scheduleTravelDuration;
	const progress = actor.scheduleJourneyBlocked
		? 0 : duration > 0 ? Math.min(1, elapsed / duration) : 1;
	sampleNpcRoadJourney(
		actor.scheduleJourney,
		smoothStep(progress),
		actor,
		actor.scheduleLaneOffset
	);
	applyScheduleState(actor, progress);
	return progress;
}

function ensureScheduleLeg(actor, anchors, period, hour, bridgeRestored) {
	const samePeriod = actor.dailyPeriod === period;
	if (actor.scheduleJourney && samePeriod && actor.scheduleBridgeRestored === bridgeRestored) {
		return;
	}
	const destination = friendlyNpcScheduleAt(actor.profile, NPC_PERIOD_START[period]);
	const previous = anchors[NPC_PREVIOUS_PERIOD[period]] || destination;
	const currentLocation = {
		x: Number(actor.routeCenterX) || 0,
		z: Number(actor.routeCenterZ) || 0
	};
	const replanning = Boolean(actor.scheduleJourney && samePeriod);
	const origin = replanning ? currentLocation : previous.location;
	if (actor.dailyPeriod && !samePeriod) {
		actor.scheduleChanges = Number(actor.scheduleChanges || 0) + 1;
	}
	actor.dailyPeriod = period;
	actor.scheduleDestination = destination;
	actor.scheduleBridgeRestored = bridgeRestored;
	actor.scheduleTravelStartHour = replanning ? hour : NPC_PERIOD_START[period];
	actor.scheduleJourney = npcRoadJourney(origin, destination.location, bridgeRestored);
	actor.scheduleJourneyBlocked = actor.scheduleJourney.totalLength <= 0.001 &&
		Math.hypot(origin.x - destination.location.x, origin.z - destination.location.z) > 0.5;
	actor.scheduleTravelDuration = npcScheduleTravelDuration(
		actor.scheduleJourney.totalLength,
		actor.profile.walkSpeed
	);
	actor.scheduleLaneOffset = laneOffsetFor(actor.profile);
}

function applyScheduleState(actor, progress) {
	const destination = actor.scheduleDestination;
	actor.activeScheduleAction = destination.action;
	actor.currentAction = actor.scheduleJourneyBlocked
		? 'awaiting-crossing'
		: progress < 1 ? `travel-to-${destination.location.id}` : destination.action;
	actor.isTravelling = !actor.scheduleJourneyBlocked && progress < 1;
	actor.navigationTarget = destination.location;
	actor.scheduleProgress = progress;
	actor.scheduleRouteLength = actor.scheduleJourney.totalLength;
}

function applyFallbackPost(actor) {
	actor.routeCenterX = Number(actor.profile?.x) || 0;
	actor.routeCenterZ = Number(actor.profile?.z) || 0;
	actor.routeDirectionX = 0;
	actor.routeDirectionZ = 1;
	actor.currentAction = 'remain-at-post';
	actor.isTravelling = false;
}

function laneOffsetFor(profile) {
	const phase = Number(profile.motionPhase) || 0;
	return Math.sin(phase * 7.31 + 0.43) * 0.42;
}

function smoothStep(value) {
	const clamped = Math.max(0, Math.min(1, value));
	return clamped * clamped * (3 - 2 * clamped);
}
