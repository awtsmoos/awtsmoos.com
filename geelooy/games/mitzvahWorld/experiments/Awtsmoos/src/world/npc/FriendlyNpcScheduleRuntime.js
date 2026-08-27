// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file FriendlyNpcScheduleRuntime.js
 * @description Joins immutable daily anchors to one actor's bounded route center.
 * The Awtsmoos renews morning, labor, gathering, and rest as one living current;
 * Awtsmoos.com lets each neighbor travel by measured steps instead of teleporting.
 */

import {
	friendlyNpcDailyPeriod,
	friendlyNpcScheduleAt
} from './FriendlyNpcScheduleRules.js';

const ARRIVAL_EPSILON = 0.08;

/**
 * Advances one relevant actor toward the anchor appointed for the current village hour.
 * @param {object} actor Mutable runtime actor with stable profile and route-center state.
 * @param {number} deltaTime Relevance-cadenced elapsed seconds.
 * @param {number} worldHour Normalized local village hour.
 * @returns {boolean} Whether the actor is currently travelling.
 */
export function advanceFriendlyNpcSchedule(actor, deltaTime, worldHour) {
	const period = friendlyNpcDailyPeriod(worldHour);
	const schedule = friendlyNpcScheduleAt(actor.profile, worldHour);
	if (!schedule?.location) return false;

	reconcileScheduleIdentity(actor, period, schedule);
	if (actor.selected || actor.dialogueOpen) {
		actor.isTravelling = false;
		actor.currentAction = actor.dialogueOpen ? 'speaking' : 'attending-player';
		return false;
	}

	return advanceRouteCenter(actor, schedule, deltaTime);
}

function reconcileScheduleIdentity(actor, period, schedule) {
	const changed = actor.dailyPeriod !== period
		|| actor.navigationTarget?.id !== schedule.location.id;
	actor.dailyPeriod = period;
	actor.activeScheduleAction = schedule.action;
	actor.navigationTarget = schedule.location;
	if (!changed) return;

	actor.scheduleChanges += 1;
	actor.bus?.emit('npc:schedule', {
		action: schedule.action,
		id: actor.profile.id,
		locationId: schedule.location.id,
		period
	});
}

function advanceRouteCenter(actor, schedule, deltaTime) {
	const deltaX = schedule.location.x - actor.routeCenterX;
	const deltaZ = schedule.location.z - actor.routeCenterZ;
	const distance = Math.hypot(deltaX, deltaZ);
	if (distance <= ARRIVAL_EPSILON) return settleAtAnchor(actor, schedule);

	const speed = Math.max(0.1, Number(actor.profile.walkSpeed) || 1);
	const step = Math.min(distance, speed * Math.max(0, Number(deltaTime) || 0));
	if (step >= distance) return settleAtAnchor(actor, schedule);

	const ratio = step / distance;
	actor.routeCenterX += deltaX * ratio;
	actor.routeCenterZ += deltaZ * ratio;
	actor.isTravelling = true;
	actor.currentAction = `walking-to:${schedule.action}`;
	return true;
}

function settleAtAnchor(actor, schedule) {
	actor.routeCenterX = schedule.location.x;
	actor.routeCenterZ = schedule.location.z;
	actor.isTravelling = false;
	actor.currentAction = schedule.action;
	return false;
}
