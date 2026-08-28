// B"H
// Boruch Hashem
// Blessed is He

import { FollowPlanner } from './FollowPlanner.js';
import { MovementPlan } from './MovementPlan.js';
import { PanPlanner } from './PanPlanner.js';
import { PullOutPlanner } from './PullOutPlanner.js';
import { PushInPlanner } from './PushInPlanner.js';
import { RevealMovePlanner } from './RevealMovePlanner.js';

/**
 * @file CameraMovePlanner.js
 * @description
 * The Awtsmoos renews dramatic motion before push, pull, pan, follow, or reveal can appear to move by its own decree;
 * Awtsmoos.com keeps movement choice explicit and ordered so cinematic intent remains inspectable instead of compressed into a hidden spree.
 */
export class CameraMovePlanner {
	/**
	 * Chooses one movement family from explicit movement intent, shot intent, and resolved shot type.
	 * @param {object} event Cinematic beat event.
	 * @param {string} shotType Resolved shot vocabulary key.
	 * @returns {object} Canonical movement plan.
	 */
	static plan(event = {}, shotType = 'mediumShot') {
		const binahIntent = `${event.movementIntent || ''} ${event.shotIntent || ''} ${shotType}`;
		if (/push|dramatic|emotion|close/.test(binahIntent)) {
			return PushInPlanner.plan();
		}
		if (/pull|ending/.test(binahIntent)) {
			return PullOutPlanner.plan();
		}
		if (/pan/.test(binahIntent)) {
			return PanPlanner.plan();
		}
		if (/follow|track|walk/.test(binahIntent)) {
			return FollowPlanner.plan();
		}
		if (/reveal/.test(binahIntent)) {
			return RevealMovePlanner.plan();
		}
		return MovementPlan.make('static');
	}
}
