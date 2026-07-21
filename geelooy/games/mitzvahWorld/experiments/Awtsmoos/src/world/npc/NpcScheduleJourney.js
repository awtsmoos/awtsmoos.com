// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NpcScheduleJourney.js
 * @description Resolves daily duties into cached, road-bound travel and arrival state.
 * The Awtsmoos renews each hour with purpose; Awtsmoos.com carries a named villager
 * from prayer to labor and home without repeating pathfinding inside every frame.
 */

import {
	friendlyNpcDailyPeriod,
	friendlyNpcScheduleAt,
	normalizeFriendlyNpcHour
} from './FriendlyNpcScheduleRules.js';
import {
	npcRoadJourney,
	sampleNpcRoadJourney
} from './NpcRoadJourney.js';

const DEFAULT_DAY_LENGTH_SECONDS = 1440;
const MAXIMUM_TRAVEL_HOURS = 2.4;
const MINIMUM_TRAVEL_HOURS = 0.25;
const PERIOD_START = Object.freeze({ day: 10, evening: 17, morning: 5, night: 21 });
const PREVIOUS_PERIOD = Object.freeze({
	day: 'morning',
	evening: 'day',
	morning: 'night',
	night: 'evening'
});

/** Mutates stable actor schedule fields and returns normalized travel progress. */
export function applyNpcScheduleJourney(actor, worldHour) {
	const anchors = actor.profile?.dailyAnchors;
	if (!anchors) {
		applyFallbackPost(actor);
		return 1;
	}
	const hour = normalizeFriendlyNpcHour(worldHour);
	const period = friendlyNpcDailyPeriod(hour);
	ensureScheduleLeg(actor, anchors, period);
	const elapsed = normalizeFriendlyNpcHour(hour - PERIOD_START[period]);
	const duration = actor.scheduleTravelDuration;
	const progress = duration > 0 ? Math.min(1, elapsed / duration) : 1;
	sampleNpcRoadJourney(
		actor.scheduleJourney,
		smoothStep(progress),
		actor,
		actor.scheduleLaneOffset
	);
	applyScheduleState(actor, progress);
	return progress;
}

/** Converts route length and walking speed into game-world travel hours. */
export function npcScheduleTravelDuration(
	routeLength,
	walkSpeed,
	dayLengthSeconds = DEFAULT_DAY_LENGTH_SECONDS
) {
	const length = Math.max(0, Number(routeLength) || 0);
	if (length <= 0.001) return 0;
	const speed = Math.max(0.2, Number(walkSpeed) || 1);
	const daySeconds = Math.max(1, Number(dayLengthSeconds) || DEFAULT_DAY_LENGTH_SECONDS);
	const worldHours = length / speed * 24 / daySeconds;
	return Math.max(MINIMUM_TRAVEL_HOURS, Math.min(MAXIMUM_TRAVEL_HOURS, worldHours));
}

function ensureScheduleLeg(actor, anchors, period) {
	if (actor.scheduleJourney && actor.dailyPeriod === period) return;
	const destination = friendlyNpcScheduleAt(actor.profile, PERIOD_START[period]);
	const origin = anchors[PREVIOUS_PERIOD[period]] || destination;
	if (actor.dailyPeriod && actor.dailyPeriod !== period) {
		actor.scheduleChanges = Number(actor.scheduleChanges || 0) + 1;
	}
	actor.dailyPeriod = period;
	actor.scheduleDestination = destination;
	actor.scheduleJourney = npcRoadJourney(origin.location, destination.location);
	actor.scheduleTravelDuration = npcScheduleTravelDuration(
		actor.scheduleJourney.totalLength,
		actor.profile.walkSpeed
	);
	actor.scheduleLaneOffset = laneOffsetFor(actor.profile);
}

function applyScheduleState(actor, progress) {
	const destination = actor.scheduleDestination;
	actor.activeScheduleAction = destination.action;
	actor.currentAction = progress < 1
		? `travel-to-${destination.location.id}`
		: destination.action;
	actor.isTravelling = progress < 1;
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
